import solidJs from "@astrojs/solid-js";
import inoxToolsRequestNanostores from "@inox-tools/request-nanostores";
import inoxToolsRequestState from "@inox-tools/request-state";
import astroBunAdapter from "@purpleduck/astro-bun-adapter";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import Icons from "unplugin-icons/vite";

// https://astro.build/config
export default defineConfig({
	output: "server",
	adapter: astroBunAdapter({
		port: 4321,
	}),
	server: {},
	vite: {
		plugins: [
			tailwindcss(),
			Icons({
				compiler: "solid",
			}),
		],
	},
	integrations: [
		solidJs(),
		inoxToolsRequestState(),
		inoxToolsRequestNanostores(),
	],
	experimental: {
		session: true,
	},
	session: {
		driver: "fs",
		cookie: {
			name: "session",
			sameSite: "strict",
		},
	},
});
