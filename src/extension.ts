import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import StringGenerators from './stringGenerators';
import { Subscription } from './dataModels';

const rootPath = vscode.workspace.workspaceFolders![0].uri.fsPath;
var extensionPath = '';
const sourceCodePath = path.join(rootPath, 'src');
const componentsPath = path.join(sourceCodePath, 'components');
const assetsPath = path.join(sourceCodePath, 'assets');
const fontsPath = path.join(assetsPath, 'fonts');
const imagesPath = path.join(assetsPath, 'images');
const stylesPath = path.join(sourceCodePath, 'app.sass');

function removeBoilerplate() {
	fs.rmSync(sourceCodePath, { recursive: true });
	
	try {
		fs.mkdirSync(sourceCodePath);
		fs.mkdirSync(componentsPath);
		fs.writeFileSync(path.join(sourceCodePath, 'index.js'), StringGenerators.indexJs);
		fs.writeFileSync(path.join(sourceCodePath, 'App.js'), StringGenerators.appJs);
		fs.writeFileSync(path.join(sourceCodePath, 'app.sass'), '');
	}
	catch (error) {
		console.log(`Failed to create files: ${error}`);
	}

	vscode.window.setStatusBarMessage('Installing Sass...', 3000);
	exec('npm i sass', { cwd: rootPath }, (error, stdout, _) => {
		if (error) {
			vscode.window.showErrorMessage('React Speedrun Tools: Failed to install sass.');
		}
	});
}

function createReactComponent() {
	vscode.window.showInputBox({ 
		prompt: 'Enter the name of the react component', 
		placeHolder: 'Ex: Navbar',
		validateInput: value =>  /^[A-Z][^\s]*$/.test(value) ? null : 'Please make sure that the component name starts with a capital letter and there are no spaces in between.'
	}).then((componentName) => {
		if (!componentName) {
			return;
		}
		
		const newComponentPath = path.join(componentsPath, `${componentName}.jsx`);
		fs.writeFileSync(newComponentPath, StringGenerators.buildComponent(componentName!));
		vscode.workspace.openTextDocument(newComponentPath).then((document) => vscode.window.showTextDocument(document).then((editor) => {
			const position = new vscode.Position(1, 11);
			editor.selection = new vscode.Selection(position, position);
		}));
	});
}

function addFont() {
	const fonts = ['Inter', 'Poppins', 'Plus Jakarta Sans', 'Roboto'];
	vscode.window.showQuickPick(fonts).then(selectedFont => {
		fs.cpSync(path.join(extensionPath, 'src/fonts', selectedFont!), fontsPath, { recursive: true });

		const fontStylesFile = path.join(sourceCodePath, '_fonts.sass');
		const existingFontStyles = fs.existsSync(fontStylesFile) ? fs.readFileSync(fontStylesFile, { encoding: 'utf-8' }) : '';
		const fontFileNames = fs.readdirSync(fontsPath).filter(fileName => fileName.startsWith(selectedFont!));
		
		if (!existingFontStyles.split('\n').some(line => line.includes(`$${selectedFont!}-fonts:`))) {
			fs.writeFileSync(fontStylesFile, StringGenerators.getFontStyling(fontFileNames, selectedFont!) + existingFontStyles);
		}

		const existingStyles = fs.readFileSync(stylesPath, { encoding: 'utf-8' });
		if (!existingStyles.split('\n').some(line => line.includes('@import fonts'))) {
			fs.writeFileSync(stylesPath, '@import fonts\n' + existingStyles);
		}
	});
	
}

function generateColorVariables() {
	fs.writeFileSync(path.join(sourceCodePath, '_colors.sass'), StringGenerators.colorVariablesTemplate);
	const existingStyles = fs.readFileSync(stylesPath, { encoding: 'utf-8' });
	fs.writeFileSync(stylesPath, '@import colors\n' + existingStyles);
}

export function activate(context: vscode.ExtensionContext) {
	const subscriptionPrefix = 'react-speedrun-tools.';
	extensionPath = context.extensionPath;
	const createSubscriptions = (subscriptions: Subscription[]) => subscriptions.map(subscription => vscode.commands.registerCommand(subscriptionPrefix + subscription.commandId, subscription.action));

	context.subscriptions.push(...createSubscriptions([
		new Subscription('removeBoilerplate', removeBoilerplate),
		new Subscription('createReactComponent', createReactComponent),
		new Subscription('addFont', addFont),
		new Subscription('generateColorVariables', generateColorVariables),
	]));
}

export function deactivate() {}
