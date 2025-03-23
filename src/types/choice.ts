import type { TLocalizedString } from "./localized-string.ts";
import type { TOption } from "./option.ts";

export type TChoice = {
	id: string;
	name: TLocalizedString;
	description: TLocalizedString;
	version: number;
	options: Array<TOption>;
} & (
	| {
			multiple: true;
			required: null;
			min: number;
			max: number | null;
	  }
	| {
			multiple: false;
			required: boolean;
			min: null;
			max: null;
	  }
);
