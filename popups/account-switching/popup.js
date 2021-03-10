import WebsiteLocalizationProvider from "../../libraries/website-l10n.js";

(async () => {
	const l10n = new WebsiteLocalizationProvider();

	//theme
	chrome.storage.sync.get(["globalTheme"], theme => {
		if (theme.globalTheme) {
			const light = document.createElement("link");
			light.setAttribute("rel", "stylesheet");
			light.setAttribute("href", "light.css");
			document.head.appendChild(light);
		}
	});

	await l10n.loadMessages(["account-switching/popup-title", "account-switching/sign-in"]);
	document.title = l10n.get("account-switching/popup-title");

	new Vue({
		el: "body",
		data: {
			users: [],
			loaded: false,
			signin: l10n.get("account-switching/sign-in")
		},
		methods: {
			removeAcc(acc) {
				var index = this.users.indexOf(acc);
				this.users.splice(index, 1);
				$(`.user:nth-child(${index})`).remove();
				chrome.cookies.set({
					url: 'https://scratch.mit.edu',
					name: "sa-account-switching",
					secure: true,
					expirationDate: 2147483647,
					value: encodeURIComponent(JSON.stringify(this.users))
				})
			},
			switchAcc(acc) {
				chrome.cookies.set({
					url: 'https://scratch.mit.edu',
					name: "scratchsessionsid",
					secure: true,
					expirationDate: 2147483647,
					value: acc.token
				})
			}
		},
		async created() {
			chrome.cookies.get({
				url: 'https://scratch.mit.edu',
				name: "sa-account-switching"
			}, cookie => {
				try {
					this.users = JSON.parse(cookie.value);
				} catch {}
				this.loaded = true;
			});
		}
	});
})();
