import { createReadStream, existsSync, promises as fs } from "node:fs";
import http from "node:http";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { seedArtists, seedReleases } from "./seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const envFile = path.join(rootDir, ".env");
const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || "127.0.0.1";
const sessions = new Set();
const { adminEmail, adminPassword, mongodbUri } = await loadEnvConfig();
let databaseReady = false;
let databaseConnectPromise = null;
const fallbackStore = {
  artists: structuredClone(seedArtists),
  releases: structuredClone(seedReleases),
  messages: [],
};

const artistSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "", trim: true },
    role: { type: String, required: true, trim: true },
    bio: { type: String, required: true, trim: true },
    location: { type: String, default: "", trim: true },
    spotlight: { type: String, default: "", trim: true },
    socials: {
      instagram: { type: String, default: "", trim: true },
      tiktok: { type: String, default: "", trim: true },
      youtube: { type: String, default: "", trim: true },
    },
    featuredOnHome: { type: Boolean, default: false, index: true },
  },
  { versionKey: false, timestamps: true }
);

const releaseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    artistId: { type: String, default: "", index: true },
    artistName: { type: String, required: true, trim: true },
    type: { type: String, default: "", trim: true },
    coverImage: { type: String, default: "", trim: true },
    summary: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    releaseDate: { type: String, default: "", index: true },
    streamingUrl: { type: String, default: "", trim: true },
    featuredOnHome: { type: Boolean, default: false, index: true },
  },
  { versionKey: false, timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    createdAtLabel: { type: String, required: true, trim: true },
  },
  { versionKey: false, timestamps: true }
);

const Artist = mongoose.models.Artist || mongoose.model("Artist", artistSchema);
const Release = mongoose.models.Release || mongoose.model("Release", releaseSchema);
const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
void connectToDatabase().catch(() => {
  // Keep the API alive even if MongoDB is temporarily unavailable at startup.
});

const server = http.createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApiRequest(request, response, url);
      return;
    }

    if (await serveStaticAsset(url.pathname, response)) {
      return;
    }

    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Not found" }));
  } catch (error) {
    console.error(error);
    const statusCode = error.statusCode || 500;
    response.writeHead(statusCode, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        error: statusCode === 500 ? "Internal server error" : error.message,
      })
    );
  }
});

server.listen(port, host, () => {
  console.log(`Cityplug backend listening on http://${host}:${port}`);
});

export { server };

async function handleApiRequest(request, response, url) {
  const method = request.method || "GET";

  if (url.pathname === "/api/health") {
    return sendJson(response, 200, {
      ok: true,
      database: databaseReady ? "connected" : "disconnected",
    });
  }

  if (url.pathname === "/api/content" && method === "GET") {
    const content = await getContent();
    return sendJson(response, 200, content);
  }

  if (url.pathname === "/api/auth/login" && method === "POST") {
    const body = await readJsonBody(request);

    if (
      String(body.email || "").trim().toLowerCase() !== adminEmail.toLowerCase() ||
      (body.password || "") !== adminPassword
    ) {
      return sendJson(response, 401, { error: "Invalid email or password" });
    }

    const token = randomUUID();
    sessions.add(token);
    return sendJson(response, 200, { token });
  }

  if (url.pathname === "/api/auth/logout" && method === "POST") {
    const token = getBearerToken(request);
    if (token) {
      sessions.delete(token);
    }
    return sendJson(response, 204, null);
  }

  if (url.pathname === "/api/admin/content" && method === "GET") {
    ensureAuthenticated(request);
    const content = await getContent();
    return sendJson(response, 200, content);
  }

  if (url.pathname === "/api/admin/messages" && method === "GET") {
    ensureAuthenticated(request);
    await ensureDatabaseReady();
    const messages = await getMessages();
    return sendJson(response, 200, messages);
  }

  if (url.pathname === "/api/messages" && method === "POST") {
    await ensureDatabaseReady();
    const payload = sanitizeMessage(await readJsonBody(request));

    const message = new Message({
      id: randomUUID(),
      ...payload,
    });
    await message.save();
    return sendJson(response, 201, toPublicDocument(message));
  }

  if (url.pathname === "/api/artists" && method === "POST") {
    ensureAuthenticated(request);
    const payload = sanitizeArtist(await readJsonBody(request));

    if (!databaseReady) {
      const artist = { id: randomUUID(), ...payload };
      fallbackStore.artists.unshift(artist);
      return sendJson(response, 201, artist);
    }

    const artist = new Artist({
      id: randomUUID(),
      ...payload,
    });
    await artist.save();
    return sendJson(response, 201, toPublicDocument(artist));
  }

  if (url.pathname === "/api/releases" && method === "POST") {
    ensureAuthenticated(request);
    const payload = sanitizeRelease(await readJsonBody(request));

    if (!databaseReady) {
      const release = { id: randomUUID(), ...payload };
      fallbackStore.releases.unshift(release);
      return sendJson(response, 201, release);
    }

    const release = new Release({
      id: randomUUID(),
      ...payload,
    });
    await release.save();
    return sendJson(response, 201, toPublicDocument(release));
  }

  if (url.pathname.startsWith("/api/artists/")) {
    ensureAuthenticated(request);
    const artistId = decodeURIComponent(url.pathname.replace("/api/artists/", ""));

    if (method === "PUT") {
      const body = sanitizeArtist(await readJsonBody(request));

      if (!databaseReady) {
        const artistIndex = fallbackStore.artists.findIndex((artist) => artist.id === artistId);

        if (artistIndex === -1) {
          return sendJson(response, 404, { error: "Artist not found" });
        }

        const updatedArtist = { ...fallbackStore.artists[artistIndex], ...body, id: artistId };
        fallbackStore.artists[artistIndex] = updatedArtist;
        fallbackStore.releases = fallbackStore.releases.map((release) =>
          release.artistId === artistId ? { ...release, artistName: updatedArtist.name } : release
        );
        return sendJson(response, 200, updatedArtist);
      }

      const updatedArtist = await Artist.findOneAndUpdate(
        { id: artistId },
        body,
        { new: true, runValidators: true }
      );

      if (!updatedArtist) {
        return sendJson(response, 404, { error: "Artist not found" });
      }

      await Release.updateMany(
        { artistId },
        { $set: { artistName: updatedArtist.name } }
      );

      return sendJson(response, 200, toPublicDocument(updatedArtist));
    }

    if (method === "DELETE") {
      if (!databaseReady) {
        const artistIndex = fallbackStore.artists.findIndex((artist) => artist.id === artistId);

        if (artistIndex === -1) {
          return sendJson(response, 404, { error: "Artist not found" });
        }

        fallbackStore.artists.splice(artistIndex, 1);
        fallbackStore.releases = fallbackStore.releases.map((release) =>
          release.artistId === artistId ? { ...release, artistId: "" } : release
        );
        return sendJson(response, 204, null);
      }

      const deletedArtist = await Artist.findOneAndDelete({ id: artistId });

      if (!deletedArtist) {
        return sendJson(response, 404, { error: "Artist not found" });
      }

      await Release.updateMany(
        { artistId },
        { $set: { artistId: "" } }
      );

      return sendJson(response, 204, null);
    }
  }

  if (url.pathname.startsWith("/api/releases/")) {
    const param = decodeURIComponent(url.pathname.replace("/api/releases/", ""));

    if (method === "GET") {
      if (!databaseReady) {
        const release =
          fallbackStore.releases.find((item) => item.slug === param) ||
          fallbackStore.releases.find((item) => item.id === param);

        if (!release) {
          return sendJson(response, 404, { error: "Release not found" });
        }

        return sendJson(response, 200, release);
      }

      const release = await Release.findOne({
        $or: [{ slug: param }, { id: param }],
      }).lean();

      if (!release) {
        return sendJson(response, 404, { error: "Release not found" });
      }

      return sendJson(response, 200, toPublicDocument(release));
    }

    ensureAuthenticated(request);

    if (method === "PUT") {
      const body = sanitizeRelease(await readJsonBody(request));

      if (!databaseReady) {
        const releaseIndex = fallbackStore.releases.findIndex((release) => release.id === param);

        if (releaseIndex === -1) {
          return sendJson(response, 404, { error: "Release not found" });
        }

        const updatedRelease = { ...fallbackStore.releases[releaseIndex], ...body, id: param };
        fallbackStore.releases[releaseIndex] = updatedRelease;
        return sendJson(response, 200, updatedRelease);
      }

      const updatedRelease = await Release.findOneAndUpdate(
        { id: param },
        body,
        { new: true, runValidators: true }
      );

      if (!updatedRelease) {
        return sendJson(response, 404, { error: "Release not found" });
      }

      return sendJson(response, 200, toPublicDocument(updatedRelease));
    }

    if (method === "DELETE") {
      if (!databaseReady) {
        const releaseIndex = fallbackStore.releases.findIndex((release) => release.id === param);

        if (releaseIndex === -1) {
          return sendJson(response, 404, { error: "Release not found" });
        }

        fallbackStore.releases.splice(releaseIndex, 1);
        return sendJson(response, 204, null);
      }

      const deletedRelease = await Release.findOneAndDelete({ id: param });

      if (!deletedRelease) {
        return sendJson(response, 404, { error: "Release not found" });
      }

      return sendJson(response, 204, null);
    }
  }

  sendJson(response, 404, { error: "Not found" });
}

async function getContent() {
  if (!databaseReady) {
    return {
      artists: [...fallbackStore.artists].sort((first, second) => {
        if (first.featuredOnHome !== second.featuredOnHome) {
          return Number(second.featuredOnHome) - Number(first.featuredOnHome);
        }

        return first.name.localeCompare(second.name);
      }),
      releases: [...fallbackStore.releases].sort((first, second) =>
        String(second.releaseDate || "").localeCompare(String(first.releaseDate || ""))
      ),
    };
  }

  const [artists, releases] = await Promise.all([
    Artist.find().sort({ featuredOnHome: -1, name: 1 }).lean(),
    Release.find().sort({ releaseDate: -1, createdAt: -1 }).lean(),
  ]);

  return {
    artists: artists.map(toPublicDocument),
    releases: releases.map(toPublicDocument),
  };
}

async function getMessages() {
  const messages = await Message.find().sort({ createdAt: -1 }).lean();
  return messages.map(toPublicDocument);
}

async function connectToDatabase() {
  if (databaseReady) {
    return;
  }

  if (!databaseConnectPromise) {
    databaseConnectPromise = mongoose
      .connect(mongodbUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      })
      .then(async () => {
        await seedDatabase();
        databaseReady = true;
      })
      .catch((error) => {
        databaseReady = false;
        databaseConnectPromise = null;
        console.error("MongoDB connection failed:", error.message);
        throw error;
      });
  }

  return databaseConnectPromise;
}

async function ensureDatabaseReady() {
  if (databaseReady) {
    return;
  }

  try {
    await connectToDatabase();
  } catch {
    const error = new Error(
      "MongoDB is not connected. The message could not be saved to the admin inbox."
    );
    error.statusCode = 503;
    throw error;
  }
}


async function seedDatabase() {
  const [artistCount, releaseCount] = await Promise.all([
    Artist.estimatedDocumentCount(),
    Release.estimatedDocumentCount(),
  ]);

  if (artistCount === 0) {
    await Artist.insertMany(seedArtists);
  }

  if (releaseCount === 0) {
    await Release.insertMany(seedReleases);
  }
}

function ensureAuthenticated(request) {
  const token = getBearerToken(request);

  if (!token || !sessions.has(token)) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    throw error;
  }
}

function getBearerToken(request) {
  const authHeader = request.headers.authorization || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");

  if (!rawBody) {
    return {};
  }

  return JSON.parse(rawBody);
}

function sanitizeArtist(body) {
  return {
    name: String(body.name || "").trim(),
    image: String(body.image || "").trim(),
    role: String(body.role || "").trim(),
    bio: String(body.bio || "").trim(),
    location: String(body.location || "").trim(),
    spotlight: String(body.spotlight || "").trim(),
    featuredOnHome: Boolean(body.featuredOnHome),
    socials: {
      instagram: String(body.socials?.instagram || "").trim(),
      tiktok: String(body.socials?.tiktok || "").trim(),
      youtube: String(body.socials?.youtube || "").trim(),
    },
  };
}

function sanitizeRelease(body) {
  const title = String(body.title || "").trim();
  return {
    slug: slugify(String(body.slug || title)),
    title,
    artistId: String(body.artistId || "").trim(),
    artistName: String(body.artistName || "").trim(),
    type: String(body.type || "").trim(),
    coverImage: String(body.coverImage || "").trim(),
    summary: String(body.summary || "").trim(),
    body: String(body.body || "").trim(),
    releaseDate: String(body.releaseDate || "").trim(),
    streamingUrl: String(body.streamingUrl || "").trim(),
    featuredOnHome: Boolean(body.featuredOnHome),
  };
}

function sanitizeMessage(body) {
  return {
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim(),
    subject: String(body.subject || "").trim(),
    message: String(body.message || "").trim(),
    createdAtLabel: new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date()),
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || randomUUID();
}

function toPublicDocument(document) {
  const plainDocument =
    typeof document.toObject === "function" ? document.toObject() : document;
  const { _id, createdAt, updatedAt, ...publicDocument } = plainDocument;
  return publicDocument;
}

async function serveStaticAsset(pathname, response) {
  if (!existsSync(distDir)) {
    return false;
  }

  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const targetPath = path.join(distDir, cleanPath);
  const resolvedPath = path.resolve(targetPath);

  if (!resolvedPath.startsWith(distDir)) {
    return false;
  }

  if (existsSync(resolvedPath)) {
    response.writeHead(200, { "Content-Type": getMimeType(resolvedPath) });
    createReadStream(resolvedPath).pipe(response);
    return true;
  }

  const indexPath = path.join(distDir, "index.html");

  if (existsSync(indexPath)) {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    createReadStream(indexPath).pipe(response);
    return true;
  }

  return false;
}

function getMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

function sendJson(response, statusCode, payload) {
  if (statusCode === 204) {
    response.writeHead(204);
    response.end();
    return;
  }

  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function loadEnvConfig() {
  let fileEnv = {};

  if (existsSync(envFile)) {
    const rawEnv = await fs.readFile(envFile, "utf8");
    fileEnv = Object.fromEntries(
      rawEnv
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const separatorIndex = line.indexOf("=");
          return [line.slice(0, separatorIndex).trim(), line.slice(separatorIndex + 1).trim()];
        })
    );
  }

  return {
    adminEmail: process.env.ADMIN_EMAIL || fileEnv.ADMIN_EMAIL || "admin@cityplug.com",
    adminPassword: process.env.ADMIN_PASSWORD || fileEnv.ADMIN_PASSWORD || "cityplug-admin",
    mongodbUri:
      process.env.MONGODB_URI ||
      fileEnv.MONGODB_URI ||
      "mongodb://127.0.0.1:27017/cityplug",
  };
}
