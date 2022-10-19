const { contextBridge, ipcRenderer } = require("electron");
const os = require("os");
const path = require("path");
const Toastify = require("toastify-js");

contextBridge.exposeInMainWorld("modules", {
  ipcRenderer: {
    on: (channel, listener) => ipcRenderer.on(channel, listener),
    send: ipcRenderer.send,
  },
  os: { getHomeDir: os.homedir },
  path: { join: path.join },
  toast: (options) => Toastify(options).showToast(),
});
