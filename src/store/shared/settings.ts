import { shared } from "@it-astro:request-nanostores";
import { atom } from "nanostores";
import type { TSettings } from "../../types/settings.ts";

export const settings_atom = shared("settings", atom<TSettings>(null as any));
