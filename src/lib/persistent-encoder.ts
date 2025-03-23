import type { PersistentEncoder } from "@nanostores/persistent";

export const persistent_econder = {
	encode: JSON.stringify,
	decode: JSON.parse,
} satisfies PersistentEncoder;
