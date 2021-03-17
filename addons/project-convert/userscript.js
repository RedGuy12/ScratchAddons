import downloadBlob from "../../libraries/download-blob.js";

export default async ({ addon, console, msg }) => {
  window.addon = addon; //ROP .
  const converters = [{ func: "https://-rex-.github.io/sb3-to-sb2-converter", name: "sb2" }];
  const modelButton = await addon.tab.waitForElement('div[class*="menu-bar_file-group"] > div:last-child', {
    markAsSeen: true,
  });
  var convertButton = Object.assign(document.createElement("div"), {
    className: "sa-convert " + modelButton.className,
    textContent: msg("record"),
    title: msg("added-by"),
  });
  var dropdownHolder = Object.assign(document.createElement("div"), {
    className: addon.tab.scratchClass("menu-bar_menu-bar-item"),
  });
  convertButton.appendChild(dropdownHolder);
  var dropdown = Object.assign(document.createElement("ul"), {
    className: addon.tab.scratchClass("menu_menu", "menu_right"),
  });
  converters.forEach((c) => {
    dropdown.appendChild(
      Object.assign(document.createElement("li"), {
        className: addon.tab.scratchClass("menu_menu", "menu_right"),
        innerText: c.name,
        onclick: c.func,
      })
    );
  });
  convertButton.addEventListener("click", async () => {});
  modelButton.parentElement.appendChild(convertButton);
};
