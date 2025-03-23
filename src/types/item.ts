import type { TChoice } from "./choice.ts";
import type { TLocalizedString } from "./localized-string.ts";

export type TItem = {
	id: number;
	version: number;
	name: TLocalizedString;
	description: TLocalizedString;
	image: string[];
	// currency: TCurrency;
	price: number;
	offerPrice: number | null;
	isAvailable: boolean;
	choices: Array<TChoice>;
};
