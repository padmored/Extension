// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "submitty" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('submitty.getToken', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		try {

			// get user id
			const userId = await vscode.window.showInputBox({
                prompt: "Enter your user ID",
                placeHolder: "User ID",
                ignoreFocusOut: true
            });

			// check user id
			if (!userId) {
                vscode.window.showWarningMessage("User ID required");
                return;
            }

			// get password
			const password = await vscode.window.showInputBox({
                prompt: "Enter your Password",
                placeHolder: "Password",
                password: true,
                ignoreFocusOut: true
            });

			// check password
            if (!password) {
                vscode.window.showWarningMessage("Password required");
                return;
            }

			// make the POST req for token
            const response = await axios.post('http://localhost:1511/api/token', {
                user_id: userId,
                password: password,
            });

			// check if successful
			const status = response.data.status;
			if(status === 'success') {
				const token = response.data.data.token;
            	vscode.window.showInformationMessage(`Token: ${token}`);
			}
			else {
				vscode.window.showWarningMessage(response.data.message);
			}
            
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to get token: ${error}`);
        }
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
