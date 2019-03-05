'use strict';

const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		backgroundColor : "#000",
		icon: __dirname + '/assets/VisualGit_Logo.png'
	});

	
	win.maximize();

	win.setTitle(require('./package.json').name);
	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);
	return win;
}

function setMyMenu() {
	const myMenu = [
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
		submenu: [
		{
			label: 'White',
			click () {
				var focusedWindow = BrowserWindow.getFocusedWindow();
				focusedWindow.webContents.send('change-to-white-style');
				console.log('white');
			}
		},
		{
			label: 'Pink',
			click () {
				var focusedWindow = BrowserWindow.getFocusedWindow();
				focusedWindow.webContents.send('change-to-pink-style');
				console.log('pink');
			}
		},
		{
			label: 'Blue',
			click () {
				var focusedWindow = BrowserWindow.getFocusedWindow();
				focusedWindow.webContents.send('change-to-blue-style');
				console.log('blue');
			}
		},
		{
			label: 'Navy',
			click () {
				var focusedWindow = BrowserWindow.getFocusedWindow();
				focusedWindow.webContents.send('change-to-navy-style');
				console.log('navy');
			}
		},
		{
			label: 'Green',
			click () {
				var focusedWindow = BrowserWindow.getFocusedWindow();
				focusedWindow.webContents.send('change-to-green-style');
				console.log('green');
			}
		},
		{
			label: 'Default',
			click () {
				var focusedWindow = BrowserWindow.getFocusedWindow();
				focusedWindow.webContents.send('change-to-default-style');
				console.log('default');
			}
		}]
	},
	{
		label: 'Help',
		submenu: [
			{
				label: require('./package.json').name + ': ' + require('./package.json').description,
				enabled: false
			},
			{type: 'separator'},
			{
				label: 'Version ' + require('./package.json').version,
				enabled: false
			},
			{
				label: 'Github Homepage',
				click () { require('electron').shell.openExternal('https://github.com/kblincoe/VisualGit_SE701'); }
			},
			{
				label: 'Features',
				click () { require('electron').shell.openExternal('https://github.com/kblincoe/VisualGit_SE701#features'); }
			},
			{
				label: 'Report Bugs or Request new Features',
				click () { require('electron').shell.openExternal('https://github.com/kblincoe/VisualGit_SE701/issues'); }
			},
			{
				label: 'Offline Support',
				click () { require('electron').shell.openItem(__dirname + '/README.pdf');   }
			},
			{type: 'separator'},
			{
				label: 'Learn More ... ',
				click () { require('electron').shell.openExternal('https://github.com/kblincoe/VisualGit_SE701#help'); }
			}
		]
	}];

	return myMenu;
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
	Menu.setApplicationMenu(Menu.buildFromTemplate(setMyMenu()));
});
