import { app, dialog, shell, Menu, BrowserWindow } from 'electron';

// Using the theme enum to get available themes
import { Theme } from './app/model/themes';

// The package.json was originally used to populate things like name, version, and description.
const vgPackage = require('../package.json');

const args = process.argv.slice(1);
// prevent window being garbage collected
let mainWindow;

const serve = args.some(val => val === '--serve');
if (serve) {
  require('electron-reload')(__dirname, {
    // This doesn't work on windows. need to use electron.cmd on windows, but that would make it incompatible:
    // electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
  });
}

function onClosed() {
  // dereference the window, allowing it to die
  mainWindow = null;
}

function createMainWindow() {
  const win = new BrowserWindow({
    backgroundColor : "#000",
    icon: __dirname + 'src/assets/VisualGit_Logo.png'
  });


  win.maximize();

  win.setTitle(vgPackage.name);
  win.loadURL(`file://${__dirname}/index.html`);
  win.on('closed', onClosed);

  if (serve) {
    win.webContents.openDevTools();
  }

  return win;
}

function createMenu() {
  return Menu.buildFromTemplate([
  {
    label: 'View',
    submenu: [
      {role: 'togglefullscreen'},
    ]
  },
  {
    label: 'Window',
    submenu: [
      {role: 'minimize'},
      {type: 'separator'},
      {role: 'close'}
    ]
  },
  {
    label: 'Style',
    // Map each theme (e.g. dark) to an element with label Dark, calling set-theme(dark)
    submenu: Object.keys(Theme).map(k => Theme[k]).map(theme => ({
      label: theme.charAt(0).toUpperCase() + theme.substr(1),
      click: () => BrowserWindow.getFocusedWindow().webContents.send('set-theme', theme.toLowerCase())
    }))
  },
  {
    label: 'Help',
    submenu: [
      {
        label: vgPackage.name + ': ' + vgPackage.description,
        enabled: false
      },
      {type: 'separator'},
      {
        label: 'Version ' + vgPackage.version,
        enabled: false
      },
      {
        label: 'Github Homepage',
        click() { shell.openExternal('https://github.com/kblincoe/VisualGit_SE701'); }
      },
      {
        label: 'Features',
        click() { shell.openExternal('https://github.com/kblincoe/VisualGit_SE701#features'); }
      },
      {
        label: 'Report Bugs or Request new Features',
        click() { shell.openExternal('https://github.com/kblincoe/VisualGit_SE701/issues'); }
      },
      {
        label: 'User Guide',
        click() { shell.openItem(__dirname + '/../UserGuide.pdf');   }
      },
      {type: 'separator'},
      {
        label: 'Learn More ... ',
        click() { shell.openExternal('https://github.com/kblincoe/VisualGit_SE701#help'); }
      }
    ]
  },
  {
    label: "Edit",
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { role: 'selectAll' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
  }]);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});

app.on('ready', () => {
  mainWindow = createMainWindow();
  Menu.setApplicationMenu(createMenu());
});

process.on("uncaughtException", (err) => {
  dialog.showMessageBox({
    type: "error",
    title: "Error in Main process",
    message: err.message
  });
});
