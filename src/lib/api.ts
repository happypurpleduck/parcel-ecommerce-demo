import ky from "ky";
import { origin_atom } from "../store/shared/origin.ts";

export type TResponse<T> = {
	status: number;
	data: T;
	message: string;
};

export const API = ky.create({
	prefixUrl: "https://ha-delivery-api.parcel24.link/v2",
	hooks: {
		beforeRequest: [
			(request) => {
				const origin = origin_atom.get();
				if (origin) {
					request.headers.set("origin", origin);
				}
			},
		],
	},
});
