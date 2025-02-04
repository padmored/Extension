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
	let getToken = vscode.commands.registerCommand('submitty.getToken', async () => {
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
				await context.secrets.store("token", token);
            	vscode.window.showInformationMessage("Token received");
			}
			else {
				vscode.window.showWarningMessage(response.data.message);
			}
            
        } catch (error) {
            vscode.window.showErrorMessage(`${error}`);
        }
	});

	let getCourses = vscode.commands.registerCommand('submitty.getCourses', async () => {
		
		// get the stored token
		let token = await context.secrets.get("token");

		// validate token
		if(!token) {
			vscode.window.showWarningMessage("Token not found, attempting to get token");
			await vscode.commands.executeCommand('submitty.getToken');
			token = await context.secrets.get("token");
			if (!token) {
				vscode.window.showErrorMessage("Failed to get token.");
				return {"archived_courses": [], "dropped_courses": [], "unarchived_courses": []};
			}
		}

		// make the GET req for courses
		const response = await axios.get('http://localhost:1511/api/courses', {
			headers: { Authorization: token }
		});

		// check if successful
		const status = response.data.status;
		if(status === 'success') {
			return response.data.data || {"archived_courses": [], "dropped_courses": [], "unarchived_courses": []};
		}
		else {
			vscode.window.showWarningMessage(response.data.message);
		}

	});

	const provider = new SubmittyViewProvider(context.extensionUri, context);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider('submitty-sidebar', provider));

	context.subscriptions.push(getToken);
	context.subscriptions.push(getCourses);
}

// This method is called when your extension is deactivated
export function deactivate() {}

class SubmittyViewProvider implements vscode.WebviewViewProvider {
	constructor(private readonly _extensionUri: vscode.Uri, public context: vscode.ExtensionContext) {}

	private view?: vscode.WebviewView;

	resolveWebviewView(
		webviewView: vscode.WebviewView,
		webViewContext: vscode.WebviewViewResolveContext,
		token: vscode.CancellationToken
	) {
		this.view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async (message) => {
			switch (message.type) {
                case "get-courses": {
					const courses = await vscode.commands.executeCommand('submitty.getCourses');
					webviewView.webview.postMessage({ type: "courses", courses });
                    break;
                }
			}
		});
	}

	private _getHtmlForWebview(webview: vscode.Webview) {

		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "css", "vscode.css"));
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "js", "submitty-sidebar.js"));

		return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Submitty View</title>
			<link href="${styleVSCodeUri}" rel="stylesheet">
        </head>
        <body>
			<button type="button" class="get-courses">Get Courses</button>

			<h1>Courses</h1>
			<h2>Archived</h2>
			<ul class="archived-course-list"></ul>
			<h2>Dropped</h2>
			<ul class="dropped-course-list"></ul>
			<h2>Unarchived</h2>
			<ul class="unarchived-course-list"></ul>
			<script src="${scriptUri}"></script>
        </body>
        </html>`;
	}
}
