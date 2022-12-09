// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);

function main() {
    setVSCodeMessageListener();
    vscode.postMessage({ command: "requestNoteData" });

    const saveButton = document.getElementById("submit-button");
    saveButton.addEventListener("click", () => saveNote());
    console.log('save add listener');
    // svg
    var cnvViewer=d3.select("#paViewer");
    cnvViewer.append("circle")
        .style("stroke", "gray")
        .style("fill", "white")
        .attr("r", 20)
        .attr("cx", 50)
        .attr("cy", 50);
    cnvViewer.append("circle")
        .style("stroke", "gray")
        .style("fill", "white")
        .attr("r", 20)
        .attr("cx", 120)
        .attr("cy", 50);
    cnvViewer.append("circle")
        .style("stroke", "gray")
        .style("fill", "white")
        .attr("r", 25)
        .attr("cx", 200)
        .attr("cy", 50);
    var svgSub=cnvViewer.append("svg");
    var circle=svgSub.selectAll("circle")
          .data([5,7,9,5,3,10,20])
          //.data([10,10,10,10,5,5]);
          //.data([10,10,10,10,5,5],function(d){return d;});
          .enter()
          .append("circle")
          .style("stroke", "black")
          //.style("fill","url(#red-light-off) #002804")
          //.style("fill","url(#yellow-light-off) #002804")
          .style("fill","url(#green-light-off) #002804")
          //.style("fill","white")
          .attr("cy",100)
          .attr("cx",function(d,i){return (i*40)+50;})
          .attr("r",function(d){return 20+d;});
    circle.exit().remove();
    console.log('svg');


}

// Stores the currently opened note info so we know the ID when we update it on save
let openedNote;

function setVSCodeMessageListener() {
  window.addEventListener("message", (event) => {
    const command = event.data.command;
    const noteData = JSON.parse(event.data.payload);

    switch (command) {
      case "receiveDataInWebview":
        openedNote = noteData;
        renderTags(openedNote.tags);
        break;
    }
  });
}

function saveNote() {
  const titleInputValue = document.getElementById("title").value;
  const noteInputValue = document.getElementById("content").value;
  const tagsInputValue = document.getElementById("tags-input").value;

  let tagsInputList = [];
  if (tagsInputValue.length > 0) {
    tagsInputList = tagsInputValue.split(",").map((tag) => tag.trim());
  }

  const noteToUpdate = {
    id: openedNote.id,
    title: titleInputValue,
    content: noteInputValue,
    tags: tagsInputList,
  };

  vscode.postMessage({ command: "updateNote", note: noteToUpdate });
}

function renderTags(tags) {
  const tagsContainer = document.getElementById("tags-container");
  clearTagGroup(tagsContainer);
  if (tags.length > 0) {
    addTagsToTagGroup(tags, tagsContainer);
    tagsContainer.style.marginBottom = "2rem";
  } else {
    // Remove tag container bottom margin if there are no tags
    tagsContainer.style.marginBottom = "0";
  }
}

function clearTagGroup(tagsContainer) {
  while (tagsContainer.firstChild) {
    tagsContainer.removeChild(tagsContainer.lastChild);
  }
}

function addTagsToTagGroup(tags, tagsContainer) {
  for (const tagString of tags) {
    const vscodeTag = document.createElement("vscode-tag");
    vscodeTag.textContent = tagString;
    tagsContainer.appendChild(vscodeTag);
  }
}
