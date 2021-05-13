export default async function ({ addon, console }) {
  while (true) {
    await addon.tab.waitForElement('a[href^="https://localhost:8333/discuss/youtube/"], a[href^="/discuss/youtube/"]');
    var elements = document.querySelectorAll(
      'a[href^="https://localhost:8333/discuss/youtube/"], a[href^="/discuss/youtube/"]'
    );
    elements.forEach((element) => {
      element.href = element.href.replace(
        "https://localhost:8333/discuss/youtube/",
        "https://www.youtube.com/watch?v="
      );
    });
  }
}
