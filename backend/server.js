import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import express from "express";
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

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }

  next();
});

void connectToDatabase().catch(() => {
  // Keep API alive if MongoDB is temporarily unavailable on boot.
});

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    database: databaseReady ? "connected" : "disconnected",
  });
});

app.get("/api/content", asyncHandler(async (_request, response) => {
  response.json(await getContent());
}));

app.post("/api/auth/login", asyncHandler(async (request, response) => {
  const { email = "", password = "" } = request.body || {};

  if (
    String(email).trim().toLowerCase() !== adminEmail.toLowerCase() ||
    password !== adminPassword
  ) {
    response.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = randomUUID();
  sessions.add(token);
  response.json({ token });
}));

app.post("/api/auth/logout", (request, response) => {
  const token = getBearerToken(request);
  if (token) {
    sessions.delete(token);
  }

  response.sendStatus(204);
});

app.get("/api/admin/content", requireAuth, asyncHandler(async (_request, response) => {
  response.json(await getContent());
}));

app.get("/api/admin/messages", requireAuth, asyncHandler(async (_request, response) => {
  await ensureDatabaseReady();
  response.json(await getMessages());
}));

app.post("/api/messages", asyncHandler(async (request, response) => {
  await ensureDatabaseReady();
  const payload = sanitizeMessage(request.body || {});
  const message = new Message({
    id: randomUUID(),
    ...payload,
  });

  await message.save();
  response.status(201).json(toPublicDocument(message));
}));

app.post("/api/artists", requireAuth, asyncHandler(async (request, response) => {
  const payload = sanitizeArtist(request.body || {});

  if (!databaseReady) {
    const artist = { id: randomUUID(), ...payload };
    fallbackStore.artists.unshift(artist);
    response.status(201).json(artist);
    return;
  }

  const artist = new Artist({
    id: randomUUID(),
    ...payload,
  });

  await artist.save();
  response.status(201).json(toPublicDocument(artist));
}));

app.post("/api/releases", requireAuth, asyncHandler(async (request, response) => {
  const payload = sanitizeRelease(request.body || {});

  if (!databaseReady) {
    const release = { id: randomUUID(), ...payload };
    fallbackStore.releases.unshift(release);
    response.status(201).json(release);
    return;
  }

  const release = new Release({
    id: randomUUID(),
    ...payload,
  });

  await release.save();
  response.status(201).json(toPublicDocument(release));
}));

app.put("/api/artists/:artistId", requireAuth, asyncHandler(async (request, response) => {
  const { artistId } = request.params;
  const body = sanitizeArtist(request.body || {});

  if (!databaseReady) {
    const artistIndex = fallbackStore.artists.findIndex((artist) => artist.id === artistId);

    if (artistIndex === -1) {
      response.status(404).json({ error: "Artist not found" });
      return;
    }

    const updatedArtist = { ...fallbackStore.artists[artistIndex], ...body, id: artistId };
    fallbackStore.artists[artistIndex] = updatedArtist;
    fallbackStore.releases = fallbackStore.releases.map((release) =>
      release.artistId === artistId ? { ...release, artistName: updatedArtist.name } : release
    );
    response.json(updatedArtist);
    return;
  }

  const updatedArtist = await Artist.findOneAndUpdate(
    { id: artistId },
    body,
    { new: true, runValidators: true }
  );

  if (!updatedArtist) {
    response.status(404).json({ error: "Artist not found" });
    return;
  }

  await Release.updateMany({ artistId }, { $set: { artistName: updatedArtist.name } });
  response.json(toPublicDocument(updatedArtist));
}));

app.delete("/api/artists/:artistId", requireAuth, asyncHandler(async (request, response) => {
  const { artistId } = request.params;

  if (!databaseReady) {
    const artistIndex = fallbackStore.artists.findIndex((artist) => artist.id === artistId);

    if (artistIndex === -1) {
      response.status(404).json({ error: "Artist not found" });
      return;
    }

    fallbackStore.artists.splice(artistIndex, 1);
    fallbackStore.releases = fallbackStore.releases.map((release) =>
      release.artistId === artistId ? { ...release, artistId: "" } : release
    );
    response.sendStatus(204);
    return;
  }

  const deletedArtist = await Artist.findOneAndDelete({ id: artistId });

  if (!deletedArtist) {
    response.status(404).json({ error: "Artist not found" });
    return;
  }

  await Release.updateMany({ artistId }, { $set: { artistId: "" } });
  response.sendStatus(204);
}));

app.get("/api/releases/:identifier", asyncHandler(async (request, response) => {
  const { identifier } = request.params;

  if (!databaseReady) {
    const release =
      fallbackStore.releases.find((item) => item.slug === identifier) ||
      fallbackStore.releases.find((item) => item.id === identifier);

    if (!release) {
      response.status(404).json({ error: "Release not found" });
      return;
    }

    response.json(release);
    return;
  }

  const release = await Release.findOne({
    $or: [{ slug: identifier }, { id: identifier }],
  }).lean();

  if (!release) {
    response.status(404).json({ error: "Release not found" });
    return;
  }

  response.json(toPublicDocument(release));
}));

app.put("/api/releases/:releaseId", requireAuth, asyncHandler(async (request, response) => {
  const { releaseId } = request.params;
  const body = sanitizeRelease(request.body || {});

  if (!databaseReady) {
    const releaseIndex = fallbackStore.releases.findIndex((release) => release.id === releaseId);

    if (releaseIndex === -1) {
      response.status(404).json({ error: "Release not found" });
      return;
    }

    const updatedRelease = { ...fallbackStore.releases[releaseIndex], ...body, id: releaseId };
    fallbackStore.releases[releaseIndex] = updatedRelease;
    response.json(updatedRelease);
    return;
  }

  const updatedRelease = await Release.findOneAndUpdate(
    { id: releaseId },
    body,
    { new: true, runValidators: true }
  );

  if (!updatedRelease) {
    response.status(404).json({ error: "Release not found" });
    return;
  }

  response.json(toPublicDocument(updatedRelease));
}));

app.delete("/api/releases/:releaseId", requireAuth, asyncHandler(async (request, response) => {
  const { releaseId } = request.params;

  if (!databaseReady) {
    const releaseIndex = fallbackStore.releases.findIndex((release) => release.id === releaseId);

    if (releaseIndex === -1) {
      response.status(404).json({ error: "Release not found" });
      return;
    }

    fallbackStore.releases.splice(releaseIndex, 1);
    response.sendStatus(204);
    return;
  }

  const deletedRelease = await Release.findOneAndDelete({ id: releaseId });

  if (!deletedRelease) {
    response.status(404).json({ error: "Release not found" });
    return;
  }

  response.sendStatus(204);
}));

if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(path.join(distDir, "index.html"));
  });
}

app.use((error, _request, response, _next) => {
  console.error(error);
  const statusCode = error.statusCode || 500;
  response.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error" : error.message,
  });
});

const server = app.listen(port, host, () => {
  console.log(`Cityplug backend listening on http://${host}:${port}`);
});

export { app, server };

function requireAuth(request, _response, next) {
  const token = getBearerToken(request);

  if (!token || !sessions.has(token)) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    next(error);
    return;
  }

  next();
}

function getBearerToken(request) {
  const authHeader = request.headers.authorization || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
}

function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
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
