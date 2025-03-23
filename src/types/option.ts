import type { TLocalizedString } from "./localized-string.ts";

export type TOption = {
	id: string;
	name: TLocalizedString;
	// currency: TCurrency;
	price: number;
	offerPrice: number | null;
	isAvailable: boolean;
};
