const { ipcRenderer } = require('electron')
const pkg = require("./package.json");

document.getElementById("version").innerText = pkg.version;

console.log("hello, app.js")

ipcRenderer.on("isUpdateNow", () => {
    if (confirm("发现了新版本， 现在重启更新？")) {
      console.info("选择了重启更新");
      ipcRenderer.send("isUpdateNow")
    } else {
      console.log("取消了更新，手动重启之后就是新版");
    }
})

ipcRenderer.on("message", (e, data) => {
    console.log(data)
})
