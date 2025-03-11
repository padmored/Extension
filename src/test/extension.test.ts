import * as assert from 'assert';

// mock user input
import * as sinon from 'sinon';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {

	let showInputBoxStub: sinon.SinonStub;
	let showWarningMessageStub: sinon.SinonStub;
    let showErrorMessageStub: sinon.SinonStub;
	let showInformationMessageStub: sinon.SinonStub;

    setup(() => {
		// wait for extension to activate
		vscode.extensions.getExtension('undefined_publisher.submitty')?.activate();

        showInputBoxStub = sinon.stub(vscode.window, 'showInputBox');
		showWarningMessageStub = sinon.stub(vscode.window, 'showWarningMessage');
        showErrorMessageStub = sinon.stub(vscode.window, 'showErrorMessage');
		showInformationMessageStub = sinon.stub(vscode.window, 'showInformationMessage');
    });

    teardown(() => {
        showInputBoxStub.restore();
		showWarningMessageStub.restore();
        showErrorMessageStub.restore();
		showInformationMessageStub.restore();
    });

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	// test register commands
	test('Test Register Command getToken', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('submitty.getToken'), 'Command is not registered');
    });

	test('Test Register Command getCourses', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('submitty.getCourses'), 'Command is not registered');
    });

	test('Test Register Command getGradeables', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('submitty.getGradeables'), 'Command is not registered');
    });

	test('Test Register Command getGradeableData', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('submitty.getGradeableData'), 'Command is not registered');
    });

	test('Test Register Command uploadFile', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('submitty.uploadFile'), 'Command is not registered');
    });

	// test calling getToken commands Valid, Invalid
	test('Test Calling Command getToken Valid', async () => {
        const testUsername = 'student';
        const testPassword = 'student';

        showInputBoxStub.onFirstCall().resolves(testUsername);
        showInputBoxStub.onSecondCall().resolves(testPassword);

        await vscode.commands.executeCommand('submitty.getToken');

		const expectedResponse = 'Token received';

        assert.strictEqual(showInformationMessageStub.firstCall.args[0], expectedResponse);
    });

	test('Test Calling Command getToken Invalid', async () => {
        const testUsername = 'invalid';
        const testPassword = 'invalid';

        showInputBoxStub.onFirstCall().resolves(testUsername);
        showInputBoxStub.onSecondCall().resolves(testPassword);

        await vscode.commands.executeCommand('submitty.getToken');

		const expectedResponse = 'Could not login using that user id or password';

        assert.strictEqual(showWarningMessageStub.firstCall.args[0], expectedResponse);
    });

	test('Test Calling Command getCourses Valid', async () => {
        const testUsername = 'student';
        const testPassword = 'student';

        showInputBoxStub.onFirstCall().resolves(testUsername);
        showInputBoxStub.onSecondCall().resolves(testPassword);

        const response = await vscode.commands.executeCommand('submitty.getCourses');

        assert.ok(response, "Response data is undefined");
    });

    test('Test Calling Command getGradeables', async () => {

        const testUsername = 'student';
        const testPassword = 'student';

        showInputBoxStub.onFirstCall().resolves(testUsername);
        showInputBoxStub.onSecondCall().resolves(testPassword);

        await vscode.commands.executeCommand('submitty.getGradeables');
    });

    test('Test Calling Command getGradeableData', async () => {

        const testUsername = 'student';
        const testPassword = 'student';

        showInputBoxStub.onFirstCall().resolves(testUsername);
        showInputBoxStub.onSecondCall().resolves(testPassword);

        await vscode.commands.executeCommand('submitty.getGradeableData');
    });

    test('Test Calling Command uploadFile', async () => {

        const testUsername = 'student';
        const testPassword = 'student';

        showInputBoxStub.onFirstCall().resolves(testUsername);
        showInputBoxStub.onSecondCall().resolves(testPassword);

        await vscode.commands.executeCommand('submitty.uploadFile');
    });

});
