const { contextBridge } = require("electron");
const fs = require("fs");
const path = require("path");

let appVersion = "0.0.0";

try {
  const pkgPath = path.join(__dirname, "..", "package.json");
  appVersion = JSON.parse(fs.readFileSync(pkgPath, "utf8")).version;
} catch {
  // keep default version
}

contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => appVersion,
  getPlatform: () => process.platform,
});
