export const formatters = {
	number: {
		currency: {} as Record<string, Intl.NumberFormat>,
	},
};

export function get_currency_formatter(currency: string) {
	formatters.number.currency[currency] ??= new Intl.NumberFormat(undefined, {
		style: "currency",
		currency,
	});

	return formatters.number.currency[currency];
}
