import { shared } from "@it-astro:request-nanostores";
import { atom } from "nanostores";
import type { TBranch } from "../../types/branch.ts";

export const branches_atom = shared("branches", atom<TBranch[]>([]));
