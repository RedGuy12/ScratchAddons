export default async function ({ addon, global, console, msg, safeMsg }) {
  function getSelectionCharacterOffsetWithin(element) {
    // https://stackoverflow.com/a/4812022/11866686
    const sel = element.ownerDocument.defaultView.getSelection();
    if (sel.rangeCount <= 0) {
      return { start: 0, end: 0 };
    }

    const range         = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const start = preCaretRange.toString().length;
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const end = preCaretRange.toString().length;
    return { start: start, end: end };
  }

  // Move caret to a specific point in a DOM element
  function setCaretPosition(el, pos) {
    // https://stackoverflow.com/a/36953852/11866686
    // Loop through all child nodes
    for (var node of el.childNodes) {
      if (node.nodeType == 3) {
        // we have a text node
        if (node.length >= pos) {
          // finally add our range
          var range = element.ownerDocument.createRange(),
            sel     = element.ownerDocument.defaultView.getSelection();
          range.setStart(node, pos);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          return -1; // we are done
        } else {
          pos -= node.length;
        }
      } else {
        pos = SetCaretPosition(node, pos);
        if (pos == -1) {
          return -1; // no need to finish the for loop
        }
      }
    }

    return pos; // needed because of recursion stuff
  }

  const bodyDiv           = document.createElement("div");
  bodyDiv.contentEditable = true;
  document.querySelector("form#post label:not([class])").addEventListener("click", (e) => {
    e.preventDefault();
    bodyDiv.focus();
  });
  bodyDiv.className     = "markup markItUpEditor wysiwyg";
  const bodyTextarea    = document.getElementById("id_body");
  bodyTextarea.readonly = true;
  bodyTextarea.addEventListener("focus", (e) => {
    e.preventDefault();
    var range           = document.createRange();
    var sel             = window.getSelection();
    console.log(sel);
    range.setStart(bodyDiv.firstChild, sel.anchorOffset);
    range.setEnd(bodyDiv.firstChild, sel.focusOffset);
    bodyDiv.focus();
    sel.removeAllRanges();
    sel.addRange(range);
  });
  bodyTextarea.parentElement.insertBefore(bodyDiv, bodyTextarea);
}
