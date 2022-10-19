const { app, BrowserWindow, ipcMain, Menu, shell } = require("electron");
const fs = require("fs");
const os = require("os");
const path = require("path");
const resizeImg = require("resize-img");

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow;

// create the main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));

  if (isDev) mainWindow.webContents.openDevTools();
}

// create the about window
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 300,
    height: 300,
  });

  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

async function resizeImage({ dest, imgPath, width, height }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    // get original file name
    const filename = path.basename(imgPath);

    // create destination folder if it doesn't exist
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);

    // write file to destination folder
    fs.writeFileSync(path.join(dest, filename), newPath);

    // send success message
    mainWindow.webContents.send("image:resize-done", { done: true });

    // open destination folder
    shell.openPath(dest);
  } catch (e) {
    console.log(e);
  }
}

// Menu template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [{ label: "about", click: createAboutWindow }],
        },
      ]
    : []),
  {
    label: "Quit",
    accelerator: "CmdOrCtrl+W",
    click: () => app.quit(),
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [{ label: "about", click: createAboutWindow }],
        },
      ]
    : []),
];

app.whenReady().then(() => {
  createMainWindow();

  // Implement main menu
  const mainMenu = Menu.buildFromTemplate(menu);

  Menu.setApplicationMenu(mainMenu);

  app.on("activate", () => (mainMenu = null));

  mainWindow.on("closed", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// respond to "image:resize" event
ipcMain.on("image:resize", (e, options) => {
  options.dest = path.join(os.homedir(), "imageresizer");

  resizeImage(options);
});

app.on("window-all-closed", () => (isMac ? "" : app.quit()));
