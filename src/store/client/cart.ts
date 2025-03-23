import { persistentAtom } from "@nanostores/persistent";
import type { TCart } from "../../types/cart.ts";
import { branch_id_atom } from "../shared/selected-branch.ts";
import type { WritableAtom } from "nanostores";
import { persistent_econder } from "../../lib/persistent-encoder.ts";

const atoms: Record<string, WritableAtom<TCart>> = {};

export function cart_atom(
	branch_id = branch_id_atom.get(),
): WritableAtom<TCart> {
	atoms[branch_id] ??= persistentAtom<TCart>(
		`cart_${branch_id}`,
		[],
		persistent_econder,
	);

	return atoms[branch_id];
}
