import Listenable from "./Listenable.js";


const promisify = (arr, key) => async (...args) => await (new Promise((resolve) => arr[key].bind(arr)(...args, resolve)));
export async function setUpStorage() {
  if (typeof scratchAddons !== "undefined") {
    const init = (storage) => {
      // turn storage from an object to an array of arrays
      var key;
      var addonStorage = {};
      for (let i = 0; i < Object.keys(storage).length; i++) {
        key = Object.keys(storage)[i].split("/");
        if (key.length == 2) {
          addonStorage[key[0]] ?? (addonStorage[key[0]] = {}); // ?? returns the preceeding value if it is not null and the following value if it is. so in this case if addonStorage[key[0]] is null, it will execute addonStorage[key[0]] = {} and return null, otherwise the value of addonStorage[key[0]]
          addonStorage[key[0]][key[1]] = Object.values(storage)[i];
        }
      }
      return addonStorage;
    };

    // Initialize scratchAddons.globalState.addonStorage from chrome.storage
    // get from chrome.storage.sync
    scratchAddons.globalState.addonStorage.sync = init(await promisify(chrome.storage.sync, "get")(null));

    // get from chrome.storage.local
    scratchAddons.globalState.addonStorage.local = init(await promisify(chrome.storage.local, "get")(null));

    // get from cookies
    scratchAddons.globalState.addonStorage.cookie = init(
      Object.fromEntries(
        (
          await promisify(chrome.cookies,"getAll")({
            url: "https://scratch.mit.edu",
          })
        ).map((c) => [c.name, c.value])
      )
    );
  }
}
export function setStorage(id, value, mode) {
  // the stuff that matters: set the value
  var storage = scratchAddons.globalState.addonStorage[mode][this._addonId] ?? {};
  storage[id] = value; // set in scratchAddons.globalState.addonStorage
  scratchAddons.globalState.addonStorage[mode][this._addonId] = storage;
  mode == "cookie"
    ? promisify(
        chrome.cookies,
        "set"
      )({
        url: "https://scratch.mit.edu",
        name: scratchAddonsAddonStorage,
        secure: false,
        expirationDate: 2147483647,
        value: JSON.stringify(scratchAddons.globalState.addonStorage[mode]),
      })
    : promisify(chrome.storage[mode], "set")({ addonStorage: scratchAddons.globalState.addonStorage[mode] }); // set it in chrome.storage/document.cookie
  return {
    name: `${this._addonId}/${id}`,
    value: value,
    mode: mode,
  };
}


/**
 * Manages storage.
 * @extends Listenable
 */
export default class Storage extends Listenable {
  constructor(addonObject) {
    super();
    this._addonId = addonObject.self.id;

    this.setStorage = chrome.storage ?
      (await import("../../background/handle-storage.js")).default(toStore) : // persistent script has access to chrome apis, import directly
      Comlink.wrap(
        Comlink.windowEndpoint(
          document.getElementById("scratchaddons-iframe-2").contentWindow,
          document.getElementById("scratchaddons-iframe-1").contentWindow
        )
      ).setStorage(toStore); // content script has no access to chrome apis, get a page that does via Comlink
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
    if (storedID.length == 0) throw new Error("Scratch Addons exception: stored ID is empty");
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

    const toStore = {
      addonStorageID: storedID,
      addonStorageValue: value,
      addonStorageMode: mode,
    };
    if (chrome.storage) {
      // persistant script has access to chrome apis, set directly
      return this.setStorageImport(toStore);
    } else {
      // content script has no access to chrome apis, ask background page to set for us
      return this.setStorageComlink(toStore);
    }
  }
  /**
   * @private
   */
  get _eventTargetKey() {
    return "storage";
  }
}
