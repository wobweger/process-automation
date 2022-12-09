// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { TestView } from './testView';

// https://github.com/microsoft/vscode-webview-ui-toolkit-samples/tree/main/default/notepad
// extensions.ts
import { v4 as uuidv4 } from "uuid";
import { NotepadDataProvider } from "./providers/NotepadDataProvider";
import { getWebviewContent } from "./ui/getWebviewContent";
import { Note } from "./types/Note";

import * as d3 from "d3";
//import * as _d3 from "d3";
import { select, Selection} from 'd3-selection';
import { getPAviewerContent } from './paViewer';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// +++++ beg: sample notepad
	let notes: Note[] = [];
	let panel: vscode.WebviewPanel | undefined = undefined;
  
	const notepadDataProvider = new NotepadDataProvider(notes);
  
	const treeView = vscode.window.createTreeView("notepad.notesList", {
	  treeDataProvider: notepadDataProvider,
	  showCollapseAll: false,
	});
	const openNote = vscode.commands.registerCommand("notepad.showNoteDetailView", () => {
		const selectedTreeViewItem = treeView.selection[0];
		const matchingNote = notes.find((note) => note.id === selectedTreeViewItem.id);
		if (!matchingNote) {
			vscode.window.showErrorMessage("No matching note found");
		  return;
		}
	
		// If no panel is open, create a new one and update the HTML
		if (!panel) {
		  panel = vscode.window.createWebviewPanel("noteDetailView", matchingNote.title, vscode.ViewColumn.One, {
			enableScripts: true,
		  });
		}
	
		// If a panel is open, update the HTML with the selected item's content
		panel.title = matchingNote.title;
		panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, matchingNote);
	
		// If a panel is open and receives an update message, update the notes array and the panel title/html
		panel.webview.onDidReceiveMessage((message) => {
		  const command = message.command;
		  const note = message.note;
		  switch (command) {
			case "updateNote":
			  const updatedNoteId = note.id;
			  const copyOfNotesArray = [...notes];
			  const matchingNoteIndex = copyOfNotesArray.findIndex((note) => note.id === updatedNoteId);
			  copyOfNotesArray[matchingNoteIndex] = note;
			  notes = copyOfNotesArray;
			  notepadDataProvider.refresh(notes);
			  panel
				? ((panel.title = note.title),
				  (panel.webview.html = getWebviewContent(panel.webview, context.extensionUri, note)))
				: null;
			  break;
		  }
		});
	
		panel.onDidDispose(
		  () => {
			// When the panel is closed, cancel any future updates to the webview content
			panel = undefined;
		  },
		  null,
		  context.subscriptions
		);
	  });
	
	  const createNote = vscode.commands.registerCommand("notepad.createNote", () => {
		const id = uuidv4();
	
		const newNote: Note = {
		  id: id,
		  title: "New note",
		  content: "",
		  tags: ["Personal"],
		};
	
		notes.push(newNote);
		notepadDataProvider.refresh(notes);
	  });
	
	  const deleteNote = vscode.commands.registerCommand("notepad.deleteNote", (node: Note) => {
		const selectedTreeViewItem = node;
		const selectedNoteIndex = notes.findIndex((note) => note.id === selectedTreeViewItem.id);
		notes.splice(selectedNoteIndex, 1);
		notepadDataProvider.refresh(notes);
	
		// Close the panel if it's open
		panel?.dispose();
	  });
	
	  // Add commands to the extension context
	  context.subscriptions.push(openNote);
	  context.subscriptions.push(createNote);
	  context.subscriptions.push(deleteNote);
		// ----- end: sample notepad

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "process-automation" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('process-automation.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from process-automation!');
	});

	// WebView
	//let disposableWebView = vscode.commands.registerCommand('process-automation.Viewer',() => {
	//	const pnPAviewer=vscode.window.createWebviewPanel(
	//		'pa.Viewer',
	//		'Process Automation Viewer',
	//		vscode.ViewColumn.One,
	//		{}
	//	);
	//	pnPAviewer.webview.html=getPAviewerContent();
		//var cnvViewer=d3.select("#paViewer");
		/*var circle=d3.selectAll("circle")
        	.data([10,5,5])
    	    .enter()
	        .append("circle");
		circle.attr("cy",40);
		circle.attr("cx",function(d,i){return (i*50)+20;});
		circle.attr("r",function(d){return d;});*/
	//});
	// Test View
	//new TestView(context);

	context.subscriptions.push(disposable);
	//context.subscriptions.push(disposableWebView);
}

// This method is called when your extension is deactivated
export function deactivate() {}
