import type { TItem } from "./item.ts";
import type { TLocalizedString } from "./localized-string.ts";

export type TCategory = {
	id: number;
	name: TLocalizedString;
	description: TLocalizedString;
	image: string;
	items: Array<TItem>;
};
