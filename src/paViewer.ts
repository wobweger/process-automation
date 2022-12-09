import * as vscode from 'vscode';

// import * as d3 from "d3";
//import {select} from "d3-selection";

export function getPAviewerContent(){
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PA Viewer</title>
        <style type="text/css"><![CDATA[

        ]]>
        </style>
    </head>
    <body>
        <svg id="paViewer" width="800" height="400" />
    </body>
    </html>`;
}
