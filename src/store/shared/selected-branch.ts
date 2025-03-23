import { shared } from "@it-astro:request-nanostores";
import { atom } from "nanostores";

export const branch_id_atom = shared("branch-id", atom<number>(null as any));
