import Electrobun, { Electroview } from "electrobun/view";

type LauncherRPC = {
	bun: {
		requests: {
			launchTSDoom: { params: {}; response: { success: boolean } };
			launchNativeDoom: { params: {}; response: { success: boolean } };
		};
		messages: {};
	};
	webview: {
		requests: {};
		messages: {
			showError: { message: string };
		};
	};
};

const rpc = Electroview.defineRPC<LauncherRPC>({
	handlers: {
		requests: {},
		messages: {
			showError: ({ message }: { message: string }) => {
				showError(message);
			},
		},
	},
});

const electrobun = new Electrobun.Electroview({ rpc });

// Wire up buttons
const btnTS = document.getElementById("btn-ts-doom")!;
const btnNative = document.getElementById("btn-native-doom")!;
const errorBanner = document.getElementById("error-banner")!;

btnTS.addEventListener("click", async () => {
	try {
		await rpc.request.launchTSDoom({});
	} catch (err) {
		showError(String(err));
	}
});

btnNative.addEventListener("click", async () => {
	try {
		await rpc.request.launchNativeDoom({});
	} catch (err) {
		showError(String(err));
	}
});

function showError(message: string) {
	errorBanner.textContent = message;
	errorBanner.classList.remove("hidden");
	setTimeout(() => {
		errorBanner.classList.add("hidden");
	}, 5000);
}
