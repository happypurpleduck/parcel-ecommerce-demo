import type { TLocalizedString } from "./localized-string.ts";
import type { TRegionCode } from "./region-code.ts";

export interface TBranch {
	id: number;
	branchName: string;
	region: {
		currency: "BHD" | "SAR";
		country: string;
		countryCode: "BH" | "SA";
		phoneCode: string;
		timezone: string;
		locale: {
			en: string;
			ar: string;
		};
		dateLocale: {
			en: string;
			ar: string;
		};
		defaultLanguage: "en" | "ar";
		currencyPrecision: number;
		regionCode: TRegionCode;
	};
	location: {
		lng: number;
		lat: number;
	};
	ecommerce: {
		/** calculated at time of the request */
		isOpen: boolean;
		/**
		 * ISO weekday
		 * @see https://en.wikipedia.org/wiki/ISO_week_date
		 */
		openingHours: Record<
			"1" | "2" | "3" | "4" | "5" | "6" | "7",
			/* ISO Time (ex. 14:05) */
			Array<[/* start */ /* start */ string, /* end */ string]>
		>;
		payment: {
			cash: boolean | null;
			online: boolean | null;
		};
		services: {
			pickup: boolean | null;
			delivery: boolean | null;
		};
		delivery:
			| {
					type: "fixed";
					minimumOrder: number;
					price: number;
					maximumDistance: number;
			  }
			| {
					type: "parcel";
					minimumOrder: number;
					extraPrice: number;
					maximumDistance: number;
			  }
			| {
					type: "area";
					areas: Array<{
						id: string;
						name: TLocalizedString;
						parcel: boolean;
						minimumOrder: number;
						price: number;
					}>;
			  };
	};
}
