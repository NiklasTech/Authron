const { app, BrowserWindow, Menu } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

let mainWindow;
let backendProcess;

function checkBackendHealth() {
  return new Promise((resolve) => {
    const http = require("http");
    const options = {
      hostname: "localhost",
      port: 8000,
      path: "/health",
      timeout: 2000,
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on("error", () => resolve(false));
    req.on("timeout", () => resolve(false));
    req.end();
  });
}

function startBackend() {
  if (isDev) {
    const backendPath = path.join(__dirname, "..", "backend");
    const rootPath = path.join(__dirname, "..");

    const venvPath = path.join(backendPath, "venv");
    const pythonExe =
      process.platform === "win32"
        ? path.join(venvPath, "Scripts", "python.exe")
        : path.join(venvPath, "bin", "python");

    backendProcess = spawn(
      pythonExe,
      [
        "-m",
        "uvicorn",
        "backend.main:app",
        "--reload",
        "--host",
        "0.0.0.0",
        "--port",
        "8000",
      ],
      {
        cwd: rootPath,
        stdio: "inherit",
        shell: true,
        env: { ...process.env, PYTHONPATH: rootPath },
      }
    );
  } else {
    const resourcesPath = process.resourcesPath || path.join(__dirname, "..");

    const possiblePaths = [
      path.join(resourcesPath, "authron-backend"),
      path.join(resourcesPath, "authron-backend.exe"),
      path.join(__dirname, "..", "authron-backend"),
      path.join(__dirname, "..", "authron-backend.exe"),
    ];

    let backendExe = null;

    for (const possiblePath of possiblePaths) {
      if (require("fs").existsSync(possiblePath)) {
        backendExe = possiblePath;
        break;
      }
    }

    if (!backendExe) {
      return;
    }

    backendProcess = spawn(backendExe, [], {
      stdio: "inherit",
      detached: false,
    });
  }

  backendProcess.on("error", (err) => {
    console.error("Backend start error:", err);
  });

  backendProcess.on("close", (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      devTools: true,
    },
    icon: path.join(__dirname, "assets", "icon.png"),
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    autoHideMenuBar: !isDev,
    show: false,
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDev) {
    const startUrl = "http://localhost:5173";
    setTimeout(() => {
      mainWindow.loadURL(startUrl);
    }, 5000);
  } else {
    const htmlPath = path.join(__dirname, "dist", "index.html");

    if (require("fs").existsSync(htmlPath)) {
      mainWindow.loadFile(htmlPath);
    } else {
      const unpackedPath = path.join(
        process.resourcesPath,
        "app.asar.unpacked",
        "dist",
        "index.html"
      );
      mainWindow.loadFile(unpackedPath);
    }
  }

  if (!isDev) {
    Menu.setApplicationMenu(null);
  } else {
    Menu.setApplicationMenu(createMenu());
  }
}

function createMenu() {
  if (!isDev) return null;

  const template = [
    {
      label: "Entwicklung",
      submenu: [
        { role: "reload", label: "Neu laden" },
        { role: "toggledevtools", label: "Entwicklertools" },
        { type: "separator" },
        { role: "quit", label: "Beenden" },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}

app.whenReady().then(async () => {
  startBackend();

  let attempts = 0;
  const maxAttempts = 15;

  const waitForBackend = async () => {
    const isHealthy = await checkBackendHealth();
    if (isHealthy || attempts >= maxAttempts) {
      createWindow();
    } else {
      attempts++;
      setTimeout(waitForBackend, 1000);
    }
  };

  setTimeout(waitForBackend, 2000);
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill("SIGTERM");
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill("SIGTERM");
  }
});
