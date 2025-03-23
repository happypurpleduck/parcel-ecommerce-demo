import { computed } from "nanostores";
import { branches_atom } from "./branches.ts";
import { branch_id_atom } from "./selected-branch.ts";
import { shared } from "@it-astro:request-nanostores";

export const branch_atom = shared(
	"branch",
	computed([branches_atom, branch_id_atom], (branches, id) => {
		return branches.find((branch) => branch.id === id);
	}),
);
