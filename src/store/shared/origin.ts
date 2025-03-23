import { shared } from "@it-astro:request-nanostores";
import { atom } from "nanostores";

export const origin_atom = shared("origin", atom<string>(null as any));
