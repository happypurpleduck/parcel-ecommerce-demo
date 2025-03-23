import type { TECommerceCurrency } from "./e-commerce-currency.ts";
import type { THexColor } from "./hex-color.ts";
import type { TLocalizedString } from "./localized-string.ts";

export type TSettings = {
	title: TLocalizedString;
	logo: string; // url
	mode: "live" | "sandbox";
	currency: {
		BHD: TECommerceCurrency;
		SAR: TECommerceCurrency;
	};
	socials: {
		// NOTE: account name only.
		// TODO: check not url/etc?
		facebook: string | null;
		instagram: string | null;
		twitter: string | null;
		whatsapp: string | null;
		snapchat: string | null;
		telegram: string | null;
		tiktok: string | null;
	};
	analytics: {
		google: string | null;
		facebookPixel: string | null;
	};
	services: {
		pickup: boolean;
		delivery: boolean;
	};
	payment: {
		cash: boolean;
		online: boolean;
	};
	theme: {
		background: THexColor;
		foreground: THexColor;

		primary: THexColor;
		primaryForeground: THexColor;

		secondary: THexColor;
		secondaryForeground: THexColor;

		accent: THexColor;
		accentForeground: THexColor;

		destructive: THexColor;
		destructiveForeground: THexColor;

		muted: THexColor;
		mutedForeground: THexColor;

		card: THexColor;
		cardForeground: THexColor;

		popover: THexColor;
		popoverForeground: THexColor;

		border: THexColor;
		borderRadius: string; // {number}px
		borderInput: THexColor;
		ring: THexColor;
	};
};
