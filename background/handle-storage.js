const promisify = (arr, key) => async (...args) => await new Promise((resolve) => arr[key].bind(arr)(...args, resolve));
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
          await promisify(chrome.cookies.getAll)({
            url: "https://scratch.mit.edu",
          })
        ).map((c) => [c.name, c.value])
      )
    );
  }
}
export function setStorage(request) {
  // the stuff that matters: set the value
  // it needs to be here because the event handler does not have access to chrome.storage in userscripts
  var id = request.addonStorageID;
  var mode = request.addonStorageMode;
  var value = request.addonStorageValue;
  var key = id.split("/"); // seperate key into stored ID and addon ID
  var storage = scratchAddons.globalState.addonStorage[mode];
  storage[key[0]] ?? (storage[key[0]] = {}); // just in case the addon has not had any other stored values before
  storage[key[0]][key[1]] = value; // set in scratchAddons.globalState.addonStorage
  scratchAddons.globalState.addonStorage[mode] = storage;
  mode == "cookie"
    ? promisify(
        chrome.cookies,
        "set"
      )({
        url: "https://scratch.mit.edu",
        name: id,
        secure: false,
        expirationDate: 2147483647,
        value: value,
      })
    : promisify(chrome.storage[mode], "set")({ [id]: value }); // set it in chrome.storage/document.cookie
  return {
    name: id,
    value: value,
    mode: mode,
  };
}
