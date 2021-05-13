(async function () {
  await checkSession();
  scratchAddons.localState.ready.auth = true;
})();

chrome.cookies.onChanged.addListener(({ cookie, changeCause }) => {
  if (cookie.name === "scratchsessionsid" || cookie.name === "scratchlanguage" || cookie.name === "scratchcsrftoken")
    checkSession();
});

function getCookieValue(name) {
  return new Promise((resolve) => {
    chrome.cookies.get(
      {
        url: "http://localhost:8333/",
        name,
      },
      (cookie) => {
        if (cookie && cookie.value) resolve(cookie.value);
        else resolve(null);
      }
    );
  });
}

async function checkSession() {
  let res;
  let json;
  try {
    res = await fetch("http://localhost:8333/session/", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    json = await res.json();
  } catch (err) {
    console.warn(err);
    json = {};
    // If Scratch is down, or there was no internet connection, recheck soon:
    if ((res && !res.ok) || !res) setTimeout(checkSession, 60000);
  }
  const scratchLang = (await getCookieValue("scratchlanguage")) || navigator.language;
  const csrfToken = await getCookieValue("scratchcsrftoken");
  scratchAddons.globalState.auth = {
    isLoggedIn: Boolean(json.user),
    username: json.user ? json.user.username : null,
    userId: json.user ? json.user.id : null,
    xToken: json.user ? json.user.token : null,
    csrfToken,
    scratchLang,
  };
}
