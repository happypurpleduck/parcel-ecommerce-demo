import type { TVatRate } from "./vat-rate.ts";

export type TECommerceCurrency =
	| {
			default: true;
			rate: 1;
			vat: TVatRate;
	  }
	| {
			default: false;
			rate: number;
			vat: TVatRate;
	  };
