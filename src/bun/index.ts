// Electrobun Doom — Main entry point
// Creates a launcher BrowserWindow with two options: TypeScript Doom and Native C Doom

import { BrowserView, BrowserWindow, type RPCSchema } from "electrobun/bun";

// RPC schema for launcher
type LauncherRPC = {
	bun: RPCSchema<{
		requests: {
			launchTSDoom: {
				params: {};
				response: { success: boolean };
			};
			launchNativeDoom: {
				params: {};
				response: { success: boolean };
			};
		};
		messages: {};
	}>;
	webview: RPCSchema<{
		requests: {};
		messages: {
			showError: { message: string };
		};
	}>;
};

const launcherRPC = BrowserView.defineRPC<LauncherRPC>({
	maxRequestTime: 30000,
	handlers: {
		requests: {
			launchTSDoom: async () => {
				try {
					console.log("Launching TypeScript Doom...");
					const { launchTSDoom } = await import("./doom-ts");
					await launchTSDoom();
					return { success: true };
				} catch (err: any) {
					console.error("Failed to launch TS Doom:", err);
					launcherWindow.webview.rpc?.send.showError({
						message: `Failed to launch: ${err.message}`,
					});
					return { success: false };
				}
			},
			launchNativeDoom: async () => {
				try {
					console.log("Launching Native C Doom...");
					const { launchNativeDoom } = await import("./doom-native");
					await launchNativeDoom();
					return { success: true };
				} catch (err: any) {
					console.error("Failed to launch Native Doom:", err);
					launcherWindow.webview.rpc?.send.showError({
						message: `Failed to launch: ${err.message}`,
					});
					return { success: false };
				}
			},
		},
		messages: {},
	},
});

const launcherWindow = new BrowserWindow({
	title: "Electrobun Doom",
	url: "views://launcher/index.html",
	frame: {
		width: 700,
		height: 500,
		x: 800,
		y: 350,
	},
	rpc: launcherRPC,
});

console.log("Electrobun Doom launcher started!");

// Auto-launch Native C Doom on startup (disabled)
