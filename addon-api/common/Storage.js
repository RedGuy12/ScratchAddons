import Listenable from "./Listenable.js";

const promisify = (arr, key) => (...args) => new Promise((resolve) => arr[key].bind(arr)(...args, resolve));
export async function setStorage(id, value, mode) {
  // the stuff that matters: set the value
  var storage = scratchAddons.globalState.addonStorage[mode][this._addonId] ?? {};
  storage[id] = value; // set in scratchAddons.globalState.addonStorage
  scratchAddons.globalState.addonStorage[mode][this._addonId] = storage;
  return mode === "cookie"
    ? promisify(
        chrome.cookies,
        "set"
      )({
        url: "https://scratch.mit.edu",
        name: "scratchAddonsAddonStorage",
        secure: false,
        expirationDate: 2147483647,
        value: JSON.stringify(scratchAddons.globalState.addonStorage[mode]),
      })
    : promisify(chrome.storage[mode], "set")({ addonStorage: scratchAddons.globalState.addonStorage[mode] }); // set it in chrome.storage/document.cookie
}

/**
 * Manages storage.
 * @extends Listenable
 */
export default class Storage extends Listenable {
  constructor(addonObject) {
    super();
    this._addonId = addonObject.self.id;

    this.setStorage = chrome.storage
      ? setStorage // persistent script has access to chrome apis, use function directly
      : Comlink.wrap(
          Comlink.windowEndpoint(
            document.getElementById("scratchaddons-iframe-2").contentWindow,
            document.getElementById("scratchaddons-iframe-1").contentWindow
          )
        ).setStorage; // content script has no access to chrome apis, get a page that does via Comlink
  }
  /**
   * Gets a stored string.
   * @param {string} storedID - ID of the string.
   * @param {string} mode - how it was stored: sync, local, or cookie
   * @throws mode is invalid.
   * @throws stored ID is of invalid type.
   * @returns {*} stored string.
   */
  get(storedID, mode) {
    if (typeof storedID !== "string") throw new Error("Scratch Addons exception: stored ID must be a string");
    if (storedID.length === 0) throw new Error("Scratch Addons exception: stored ID is empty");
    if (!["sync", "local", "cookie"].includes(mode))
      throw new Error("Scratch Addons exception: mode must be one of: sync, local, or cookie");

    return scratchAddons.globalState.addonStorage[mode][this._addonId]?.[storedID];
  }
  /**
   * Stores a string.
   * @param {string} storedID - ID of the string.
   * @param {*} value - value to store.
   * @param {string} mode - how to store: sync, local, or cookie
   * @throws mode is invalid.
   * @throws stored ID is of invalid type.
   * @throws stored ID is empty.
   * @throws stored ID has invalid characters.
   * @throws value is of invalid type.
   * @returns {null}.
   */
  async set(storedID, value, mode) {
    if (typeof storedID !== "string") throw new Error("Scratch Addons exception: stored ID must be a string");
    if (storedID.length == 0) throw new Error("Scratch Addons exception: stored ID is empty");
    if (!["sync", "local", "cookie"].includes(mode))
      throw new Error("Scratch Addons exception: mode must be one of: sync, local, or cookie");

    return this.setStorage(storedID, value, mode);
  }
  /**
   * @private
   */
  get _eventTargetKey() {
    return "storage";
  }
}
