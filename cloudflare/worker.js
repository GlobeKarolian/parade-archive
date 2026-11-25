// Serves the parade archive at karolian.com/parade/ from the files in this repo.
// Routes: *karolian.com/parade and *karolian.com/parade/*
const ORIGIN = "https://raw.githubusercontent.com/GlobeKarolian/parade-archive/main/";
const TYPES = {
  html: "text/html; charset=utf-8",
  json: "application/json; charset=utf-8",
  jpg: "image/jpeg",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405 });
    }
    if (url.pathname === "/parade") {
      return Response.redirect(url.origin + "/parade/" + url.search, 301);
    }
    let file = url.pathname.slice("/parade/".length) || "index.html";
    const ext = file.split(".").pop().toLowerCase();
    // Top-level site files only: no folders, no dotfiles, known types.
    if (!/^[\w-]+\.[a-z]+$/.test(file) || !TYPES[ext]) {
      return new Response("Not found", { status: 404 });
    }
    const upstream = await fetch(ORIGIN + file, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (!upstream.ok) return new Response("Not found", { status: 404 });
    return new Response(request.method === "HEAD" ? null : upstream.body, {
      headers: {
        "content-type": TYPES[ext],
        "cache-control": "public, max-age=300",
        "x-content-type-options": "nosniff",
      },
    });
  },
};
