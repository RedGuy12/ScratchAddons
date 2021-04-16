import Listenable from "./Listenable.js";

/**
 * Manages storage.
 * @extends Listenable
 */
export default class Storage extends Listenable {
  constructor(addonObject) {
    super();
    this._addonId = addonObject.self.id;
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
    if (typeof storedID !== "string") {
      throw new Error("Scratch Addons exception: stored ID must be a string");
    }
    if (storedID.length == 0) {
      throw new Error("Scratch Addons exception: stored ID is empty");
    }
    if (storedID.indexOf("/") > -1) {
      throw new Error("Scratch Addons exception: stored ID can not have /s");
    }
    if (!["sync", "local", "cookie"].includes(mode)) {
      throw new Error("Scratch Addons exception: mode must be one of: sync, local, or cookie");
    }
    return scratchAddons.globalState.addonStorage[mode][this._addonId]?.[storedID];
  }
  /**
   * Stores a string.
   * @param {string} storedID - ID of the string.
   * @param {*} value - value to store.
   * @param {string} mode - how to store: sync, local, or cookie
   * @throws mode is invalid.
   * @throws stored ID is of invalid type.
   * @throws stored ID has invalid charecters.
   * @throws stored ID is empty.
   * @returns {null}.
   */
  async set(storedID, value, mode) {
    if (typeof storedID !== "string") {
      throw new Error("Scratch Addons exception: stored ID must be a string");
    }
    if (storedID.length == 0) {
      throw new Error("Scratch Addons exception: stored ID is empty");
    }
    if (storedID.indexOf("/") > -1) {
      throw new Error("Scratch Addons exception: stored ID can not have /s");
    }
    if (!["sync", "local", "cookie"].includes(mode)) {
      throw new Error("Scratch Addons exception: mode must be one of: sync, local, or cookie");
    }
    this._setStorage({
      addonStorageID: this._addonId + "/" + storedID,
      addonStorageValue: value,
      addonStorageMode: mode,
    });
  }
  /**
   * @private
   */
  async _setStorage(storage) {
    if (chrome.storage) {
      // persistant script has access to chrome apis, set directly
      return (await import("../../background/handle-storage.js")).default(storage);
    } else {
      // content script has no access to chrome apis, ask background page to set for us
      return scratchAddons.methods.setStorage(storage);
    }
  }
  /**
   * @private
   */
  get _eventTargetKey() {
    return "storage";
  }
}
