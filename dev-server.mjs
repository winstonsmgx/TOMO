/* Chạy thử trên máy, không cần Vercel CLI: node dev-server.mjs (mặc định cổng 3000).
   Phục vụ thư mục public/ và chuyển /api/<tên> vào api/<tên>.js giống Vercel. */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { existsSync, readFileSync } from "node:fs";

for (const f of [".env.local", ".env"]) if (existsSync(f)) for (const line of readFileSync(f, "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !(m[1] in process.env) && m[2] !== "") process.env[m[1]] = m[2];
}
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".md": "text/markdown; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const PORT = Number(process.env.PORT || 3000);

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      const name = url.pathname.slice(5).replace(/[^a-z0-9_-]/gi, "");
      const file = `./api/${name}.js`;
      if (!name || name.startsWith("_") || !existsSync(file)) { res.writeHead(404).end("not found"); return; }
      const mod = await import(file);
      const fn = mod[req.method];
      if (!fn) { res.writeHead(405).end("method not allowed"); return; }
      const chunks = []; for await (const c of req) chunks.push(c);
      const request = new Request(url, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks) });
      const r = await fn(request);
      const headers = {}; r.headers.forEach((v, k) => { headers[k] = v; });
      res.writeHead(r.status, headers);
      if (r.body) { const rd = r.body.getReader(); for (;;) { const { done, value } = await rd.read(); if (done) break; res.write(value); } }
      res.end(); return;
    }
    let p = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    if (p.endsWith("/")) p += "index.html";
    const file = join("public", p);
    if (!(await stat(file).catch(() => null))?.isFile()) { res.writeHead(404).end("not found"); return; }
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    res.end(await readFile(file));
  } catch (e) { console.error(e); if (!res.headersSent) res.writeHead(500); res.end(String(e.message)); }
}).listen(PORT, () => console.log(`TOMO prototype: http://localhost:${PORT}`));
