type RGB = {
	red: number;
	green: number;
	blue: number;
};

export function HEX2RGB(input: string) {
	let hex = input.startsWith("#") ? input.substring(1) : input;

	if (hex.length === 3) {
		// TODO: 'simpler way'
		hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
	}

	const value = Number.parseInt(hex, 16);

	// TODO: handle error

	const red = (value >> 16) & 255;
	const green = (value >> 8) & 255;
	const blue = value & 255;

	return {
		red,
		green,
		blue,
		string: `${red}, ${green}, ${blue}`,
	};
}

export function RGB2HSL(input: RGB) {
	const red = input.red / 255;
	const green = input.green / 255;
	const blue = input.blue / 255;

	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);

	let hue = 0;
	let saturation = 0;
	const luminance = (max + min) / 2;

	if (max !== min) {
		const difference = max - min;

		saturation =
			luminance > 0.5 ? difference / (2 - max - min) : difference / (max + min);

		switch (max) {
			case red: {
				hue = (green - blue) / difference + (green < blue ? 6 : 0);
				break;
			}
			case green: {
				hue = (blue - red) / difference + 2;
				break;
			}
			case blue: {
				hue = (red - green) / difference + 4;
				break;
			}
		}

		hue /= 6;
	}

	hue *= 360;

	return {
		hue,
		saturation,
		luminance,
		string: `${hue}, ${saturation * 100}%, ${luminance * 100}%`,
	};
}

export function HEX2HSL(input: string) {
	return RGB2HSL(HEX2RGB(input));
}
