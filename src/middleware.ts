import type { APIContext, MiddlewareNext } from "astro";
import { sequence } from "astro:middleware";
import { API, type TResponse } from "./lib/api.ts";
import { branches_atom } from "./store/shared/branches.ts";
import { origin_atom } from "./store/shared/origin.ts";
import { settings_atom } from "./store/shared/settings.ts";
import type { TBranch } from "./types/branch.ts";
import type { TSettings } from "./types/settings.ts";
import { branch_id_atom } from "./store/shared/selected-branch.ts";

declare global {
	namespace App {
		interface SessionData {
			branch: number;
		}
	}
}

export const onRequest = sequence(
	async function set_origin(context, next) {
		const hostname = new URL(context.request.url);
		hostname.pathname = "/";
		hostname.port = "";

		origin_atom.set(hostname.toString());

		return next();
	},

	async function branch(context, next) {
		if (context.routePattern.startsWith("/api")) {
			return next();
		}

		const branches = await API.get<TResponse<TBranch[]>>(
			"ecommerce/branch/all",
		).json();

		branches_atom.set(branches.data);

		// if (branches.data.length === 1) {
		// 	const id = branches.data[0].id;
		// 	context.session?.set("branch", id);
		// 	branch_id_atom.set(id);
		// }

		const branch_id = await context.session?.get("branch");
		if (typeof branch_id !== "number" || Number.isNaN(branch_id)) {
			return next("/");
		}

		if (branches.data.some((branch) => branch.id === branch_id)) {
			branch_id_atom.set(branch_id);
			// return next(`/${branch_id}`);
		} else {
			context.session?.delete("branch");
			return next("/");
		}

		return next();
	},

	async function settings_middleware(_context, next) {
		const settings =
			await API.get("ecommerce/settings").json<TResponse<TSettings>>();

		settings_atom.set(settings.data);

		return next();
	},
);
