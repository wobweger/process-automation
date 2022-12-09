import { Webview, Uri } from "vscode";
import { Note } from "../types/Note";
import { getUri } from "../utilities/getUri";

/**
 * Defines and returns the HTML that should be rendered within the notepad webview panel.
 *
 * @remarks This is also the place where references to CSS and JavaScript files/packages
 * (such as the Webview UI Toolkit) are created and inserted into the webview HTML.
 *
 * @param webview A reference to the extension webview
 * @param extensionUri The URI of the directory containing the extension
 * @param note An object representing a notepad note
 * @returns A template string literal containing the HTML that should be
 * rendered within the webview panel
 */
export function getWebviewContent(webview: Webview, extensionUri: Uri, note: Note) {
  const uriToolkit = getUri(webview, extensionUri, ["node_modules",
                          "@vscode","webview-ui-toolkit","dist","toolkit.js",
                          ]);
  const uriD3 = getUri(webview, extensionUri, ["node_modules",
                          "d3","dist","d3.min.js",
                          ]);
  const uriStyle = getUri(webview, extensionUri, ["webview-ui", "style.css"]);
  const uriMain = getUri(webview, extensionUri, ["webview-ui", "main.js"]);

  const formattedTags = note.tags ? note.tags.join(", ") : null;

  webview.onDidReceiveMessage((message) => {
    const command = message.command;
    switch (command) {
      case "requestNoteData":
        webview.postMessage({
          command: "receiveDataInWebview",
          payload: JSON.stringify(note),
        });
        break;
    }
  });

  return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script type="module" src="${uriToolkit}"></script>
          <script type="module" src="${uriMain}"></script>
          <script type="module" src="${uriD3}"></script>
          <link rel="stylesheet" href="${uriStyle}">
          <title>${note.title}</title>
      </head>
      <body id="webview-body">
        <svg id="paViewer" class="viewer" 
          viewBox="20 20 400 320" preserveAspectRatio="xMinYMin meet"width="800px" height="200px">
          <defs>
            <circle id="light" cx="70" r="30" />
            <radialGradient id="red-light-on" fx="0.45" fy="0.4">
            <stop stop-color="orange" offset="0.1"/>
            <stop stop-color="red" offset="0.8"/>
            <stop stop-color="brown" offset="1.0"/>
         </radialGradient>
         <radialGradient id="red-light-off" fx="0.45" fy="0.4">
             <stop stop-color="maroon" offset="0"/>
             <stop stop-color="#220000" offset="0.7"/>
             <stop stop-color="black" offset="1.0"/>
         </radialGradient>
         <radialGradient id="yellow-light-on" fx="0.45" fy="0.4">
             <stop stop-color="yellow" offset="0.1"/>
             <stop stop-color="orange" offset="0.6"/>
             <stop stop-color="darkOrange" offset="1.0"/>
         </radialGradient>
         <radialGradient id="yellow-light-off" fx="0.45" fy="0.4">
             <stop stop-color="#A06000" offset="0"/>
             <stop stop-color="#804000" offset="0.7"/>
             <stop stop-color="#502000" offset="1"/>
         </radialGradient>
         <radialGradient id="green-light-on" fx="0.45" fy="0.4">
             <stop stop-color="#88FF00" offset="0.1"/>
             <stop stop-color="forestGreen" offset="0.7"/>
             <stop stop-color="darkGreen" offset="1.0"/>
         </radialGradient>
         <radialGradient id="green-light-off" fx="0.45" fy="0.4">
             <stop stop-color="#007000" offset="0"/>
             <stop stop-color="#004000" offset="0.6"/>
             <stop stop-color="#001000" offset="1.0"/>
         </radialGradient>
         <linearGradient id="metal" spreadMethod="repeat"
                         gradientTransform="scale(0.7) rotate(75)">
             <stop stop-color="#808080" offset="0"/>
             <stop stop-color="#404040" offset="0.25"/>
             <stop stop-color="#C0C0C0" offset="0.35"/>
             <stop stop-color="#808080" offset="0.5"/>
             <stop stop-color="#E0E0E0" offset="0.7"/>
             <stop stop-color="#606060" offset="0.75"/>
             <stop stop-color="#A0A0A0" offset="0.9"/>
             <stop stop-color="#808080" offset="1"/>
         </linearGradient>
        </defs>
        <rect x="20" y="20" width="100" height="280" 
              fill="url(gradients.svg#metal) silver" 
              stroke="black" stroke-width="3" /> 
          <g stroke="black" stroke-width="2">
              <g class="red light" >
                  <use xlink:href="#light" y="80" 
                       fill="url(#red-light-off) maroon" />
                  <use class="lit" xlink:href="#light" y="80" 
                       fill="url(#red-light-on) red" >
                      <title>STOP</title>
                  </use>
              </g>
              <g class="yellow light">
                  <use xlink:href="#light" y="160" 
                       fill="url(#yellow-light-off) #705008" />
                  <use class="lit" xlink:href="#light" y="160" 
                       fill="url(#yellow-light-on) yellow" />
              </g>
              <g class="green light">
                  <use xlink:href="#light" y="240" 
                       fill="url(#green-light-off) #002804" />
                  <use class="lit" xlink:href="#light" y="240" 
                       fill="url(#green-light-on) lime" >
                      <title>GO</title>
                  </use>
              </g>
          </g>
        </svg>
        <header>
          <h1>${note.title}</h1>
          <div id="tags-container"></div>
        </header>
        <section id="notes-form">
          <vscode-text-field id="title" value="${note.title}" placeholder="Enter a name">Title</vscode-text-field>
          <vscode-text-area id="content"value="${note.content}" placeholder="Write your heart out, Shakespeare!" resize="vertical" rows=15>Note</vscode-text-area>
          <vscode-text-field id="tags-input" value="${formattedTags}" placeholder="Add tags separated by commas">Tags</vscode-text-field>
          <vscode-button id="submit-button">Save</vscode-button>
        </section>
      </body>
    </html>
  `;
}
