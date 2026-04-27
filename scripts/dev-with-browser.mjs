/**
 * Starts `next dev` and opens the default browser when the server responds.
 * Cursor chat links to localhost often do not open — this avoids that.
 */
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exec, spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const port = process.env.PORT || "3000";
const url = `http://127.0.0.1:${port}`;

const nextBin =
  process.platform === "win32"
    ? path.join(root, "node_modules", ".bin", "next.cmd")
    : path.join(root, "node_modules", ".bin", "next");

const child = spawn(nextBin, ["dev"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env },
});

function openBrowser() {
  const cmd =
    process.platform === "darwin"
      ? `open "${url}"`
      : process.platform === "win32"
        ? `start "" "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd, { cwd: root }, () => {});
}

let opened = false;
const poll = setInterval(() => {
  if (opened) return;
  const req = http.get(url, (res) => {
    if (res.statusCode && res.statusCode < 500) {
      opened = true;
      clearInterval(poll);
      openBrowser();
    }
    res.resume();
  });
  req.on("error", () => {});
  req.setTimeout(1200, () => req.destroy());
}, 700);

setTimeout(() => clearInterval(poll), 90_000);

child.on("exit", (code) => {
  clearInterval(poll);
  process.exit(code ?? 0);
});
