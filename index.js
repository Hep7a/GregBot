const { spawnSync } = require("child_process")

console.log("Creating shell...")

const shell = spawnSync("npm start", {
  shell: true,
  stdio: "inherit"
})