import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.ESBUILD_BINARY_PATH = path.join(__dirname, "node_modules", "@esbuild", "win32-x64", "esbuild.exe");

const esbuild = await import("esbuild");
await esbuild.initialize({});

const ROOT = __dirname;
const PORT = 5173;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

async function transformFile(filePath, rootUrl) {
  const ext = path.extname(filePath);
  if (ext === ".tsx" || ext === ".ts") {
    const source = fs.readFileSync(filePath, "utf-8");
    const result = await esbuild.transform(source, {
      loader: ext === ".tsx" ? "tsx" : "ts",
      jsx: "automatic",
      sourcemap: "inline",
      sourcefile: path.relative(ROOT, filePath),
    });
    return {
      content: result.code,
      contentType: MIME_TYPES[".js"],
    };
  }
  if (ext === ".css") {
    const source = fs.readFileSync(filePath, "utf-8");
    return {
      content: source,
      contentType: MIME_TYPES[".css"],
    };
  }
  return null;
}

function resolveModulePath(importPath, importer) {
  // If it's a relative import, resolve against the importer
  if (importPath.startsWith("./") || importPath.startsWith("../")) {
    const resolved = path.resolve(path.dirname(importer), importPath);
    // Try various extensions
    for (const ext of ["", ".tsx", ".ts", ".js", ".jsx", "/index.tsx", "/index.ts", "/index.js"]) {
      const full = resolved + ext;
      if (fs.existsSync(full)) return full;
    }
    // Try actual .js in node_modules
    if (fs.existsSync(resolved)) return resolved;
    return resolved + ".tsx";
  }
  // It's a bare import (from node_modules)
  return null;
}

const server = http.createServer(async (req, res) => {
  try {
    let url = new URL(req.url, `http://localhost:${PORT}`);
    let filePath = path.join(ROOT, url.pathname === "/" ? "index.html" : url.pathname);

    // If the requested file doesn't exist, try .tsx / .ts extension
    if (!fs.existsSync(filePath)) {
      for (const ext of [".tsx", ".ts"]) {
        const alt = filePath + ext;
        if (fs.existsSync(alt)) {
          filePath = alt;
          break;
        }
      }
    }

    if (filePath.endsWith(".html")) {
      let html = fs.readFileSync(filePath, "utf-8");
      res.writeHead(200, { "Content-Type": MIME_TYPES[".html"] });
      res.end(html);
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const result = await transformFile(filePath, url.pathname);
      if (result) {
        res.writeHead(200, { "Content-Type": result.contentType });
        res.end(result.content);
        return;
      }
      // Static file
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // Not found
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  } catch (err) {
    console.error("Server error:", err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal server error");
  }
});

server.listen(PORT, () => {
  console.log(`✅ 开发服务器运行在 http://localhost:${PORT}`);
  console.log(`   (使用 Ctrl+C 停止)`);
});

// Watch for changes using node:fs.watch
const watchedFiles = new Map();
function watchDir(dir) {
  if (watchedFiles.has(dir)) return;
  watchedFiles.set(dir, true);
  try {
    fs.watch(dir, (eventType, filename) => {
      if (filename && (filename.endsWith(".tsx") || filename.endsWith(".ts") || filename.endsWith(".css") || filename.endsWith(".html"))) {
        console.log(`🔄 文件已更新: ${filename}`);
      }
    });
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") {
        watchDir(full);
      }
    }
  } catch (e) {
    // Ignore permission errors
  }
}
watchDir(path.join(ROOT, "src"));