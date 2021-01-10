const {app, BrowserWindow, ipcMain} = require('electron')
const {autoUpdater} = require("electron-updater")

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    //处理更新操作
    function handleUpdate() {
        const returnData = {
            error: {status: -1, msg: '检测更新查询异常'},
            checking: {status: 0, msg: '正在检查应用程序更新'},
            updateAva: {status: 1, msg: '检测到新版本，正在下载,请稍后'},
            updateNotAva: {status: -1, msg: '您现在使用的版本为最新版本,无需更新!'},
        };

        //和之前package.json配置的一样
        autoUpdater.setFeedURL('http://localhost:8080/');

        //更新错误
        autoUpdater.on('error', function (error) {
            sendUpdateMessage(returnData.error)
            sendUpdateMessage(error)
        });

        //检查中
        autoUpdater.on('checking-for-update', function () {
            sendUpdateMessage(returnData.checking)
        });

        //发现新版本
        autoUpdater.on('update-available', function (info) {
            console.log("发现了新版本")
            sendUpdateMessage(returnData.updateAva)
        });

        //当前版本为最新版本
        autoUpdater.on('update-not-available', function (info) {
            setTimeout(function () {
                sendUpdateMessage(returnData.updateNotAva)
            }, 1000);
        });

        // 更新下载进度事件
        autoUpdater.on('download-progress', function (progressObj) {
            win.webContents.send('downloadProgress', progressObj)
        });


        autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
            sendUpdateMessage("下载更新完成")
            ipcMain.on('isUpdateNow', (e, arg) => {
                //some code here to handle event
                autoUpdater.quitAndInstall();
            });
            win.webContents.send('isUpdateNow')
        });

        autoUpdater.on('downloadUpdate', () => {
            sendUpdateMessage("开始下载更新")
            autoUpdater.downloadUpdate()
        });

        setTimeout(() => {
            //执行自动更新检查
            autoUpdater.checkForUpdates();
        }, 2000)
    }

    handleUpdate();

    // 通过main进程发送事件给renderer进程，提示更新信息
    function sendUpdateMessage(text) {
        win.webContents.send('message', text)
    }

    win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    app.quit()
})

