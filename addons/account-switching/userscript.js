export default async function ({
	console, // ROP .
	addon
}) {
	// get sid info from cookie
	var users;
	try {
		users = JSON.parse(decodeURIComponent(/; sa-account-switching=(.*?);/.exec(document.cookie + ";")[1]));
	} catch {
		users = [];
	}
	main();
	addon.auth.addEventListener("change", () => main())

	function main() {
		if (addon.auth.isLoggedIn && users.find(i => i.username != addon.auth.username)) {
			// get the current user's sid if we don't already have it
			chrome.cookies.get({
				url: "https://scratch.mit.edu",
				name: "scratchsessionsid"
			}, cookie => {
				users.push({
					username: addon.auth.username,
					token: cookie.value
				});
				console.log(users); // ROP .
				document.cookie = `sa-account-switching=${encodeURIComponent(JSON.stringify(users))};expires=Fri, 12 Sep 275760 18:10:24 GMT;path=/`;
			})
		}
	}
}
