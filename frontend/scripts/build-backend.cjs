const { spawn } = require("child_process");
const path = require("path");

function buildBackend() {
  return new Promise((resolve, reject) => {
    const backendPath = path.join(__dirname, "..", "..", "backend");

    console.log("Building backend executable...");

    const pythonExe = process.platform === "win32" ? "python" : "python3";
    const buildProcess = spawn(pythonExe, ["build_executable.py"], {
      cwd: backendPath,
      stdio: "inherit",
    });

    buildProcess.on("close", (code) => {
      if (code === 0) {
        console.log("Backend build successful");
        resolve();
      } else {
        reject(new Error(`Backend build failed with code ${code}`));
      }
    });
  });
}

module.exports = buildBackend;

if (require.main === module) {
  buildBackend().catch(console.error);
}
