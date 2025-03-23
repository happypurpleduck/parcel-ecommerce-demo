import type { TChoice } from "./choice.ts";
import type { TItem } from "./item.ts";

export type TCart = Array<
	Omit<TItem, "choices"> & {
		cartId: string;
		quantity: number;
		note: string;

		choices: Array<
			TChoice & {
				cartId: string;
				selected: string[];
			}
		>;
	}
>;
