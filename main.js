const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 320,
        height: 660,
        frame: false,
        transparent: true,
        icon: path.join(__dirname, 'icon_coelho.ico'), // ÍCONE DO APP (.ico)
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);