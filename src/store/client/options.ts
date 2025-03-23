import { persistentMap } from "@nanostores/persistent";
import { settings_atom } from "../shared/settings.ts";
import type { MapStore } from "nanostores";
import { branch_id_atom } from "../shared/selected-branch.ts";
import { persistent_econder } from "../../lib/persistent-encoder.ts";

interface Options {
	modal_open: boolean;
	service: "pickup" | "delivery" | null;
}

const atoms: Record<string, MapStore<Options>> = {};

export function options_atom(
	branch_id = branch_id_atom.get(),
): MapStore<Options> {
	const settings = settings_atom.get();

	atoms[branch_id] ??= persistentMap<Options>(
		`options_${branch_id}`,
		{
			modal_open: settings.services.pickup && settings.services.delivery,
			service:
				settings.services.pickup && settings.services.delivery
					? null
					: settings.services.pickup
						? "pickup"
						: settings.services.delivery
							? "delivery"
							: null,
		},
		persistent_econder,
	);

	return atoms[branch_id];
}
