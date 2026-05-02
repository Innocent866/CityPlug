const JSON_HEADERS = {
  "Content-Type": "application/json",
};

function withAuth(token) {
  return token
    ? {
        ...JSON_HEADERS,
        Authorization: `Bearer ${token}`,
      }
    : JSON_HEADERS;
}

async function request(path, options = {}) {
  const response = await fetch(path, options);

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export function getPublicContent() {
  return request("/api/content");
}

export function getRelease(slug) {
  return request(`/api/releases/${slug}`);
}

export function adminLogin(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password }),
  });
}

export function adminLogout(token) {
  return request("/api/auth/logout", {
    method: "POST",
    headers: withAuth(token),
  });
}

export function getAdminContent(token) {
  return request("/api/admin/content", {
    headers: withAuth(token),
  });
}

export function getAdminMessages(token) {
  return request("/api/admin/messages", {
    headers: withAuth(token),
  });
}

export function createMessage(payload) {
  return request("/api/messages", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
}

export function createArtist(token, payload) {
  return request("/api/artists", {
    method: "POST",
    headers: withAuth(token),
    body: JSON.stringify(payload),
  });
}

export function updateArtist(token, artistId, payload) {
  return request(`/api/artists/${artistId}`, {
    method: "PUT",
    headers: withAuth(token),
    body: JSON.stringify(payload),
  });
}

export function deleteArtist(token, artistId) {
  return request(`/api/artists/${artistId}`, {
    method: "DELETE",
    headers: withAuth(token),
  });
}

export function createRelease(token, payload) {
  return request("/api/releases", {
    method: "POST",
    headers: withAuth(token),
    body: JSON.stringify(payload),
  });
}

export function updateRelease(token, releaseId, payload) {
  return request(`/api/releases/${releaseId}`, {
    method: "PUT",
    headers: withAuth(token),
    body: JSON.stringify(payload),
  });
}

export function deleteRelease(token, releaseId) {
  return request(`/api/releases/${releaseId}`, {
    method: "DELETE",
    headers: withAuth(token),
  });
}
