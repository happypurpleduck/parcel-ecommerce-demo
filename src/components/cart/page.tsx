import { useStore } from "@nanostores/solid";
import * as v from "valibot";
import {
	createEffect,
	createResource,
	createSignal,
	For,
	Show,
} from "solid-js";
import { get_currency_formatter } from "../../lib/formatter.ts";
import { cart_atom } from "../../store/client/cart.ts";
import { branch_atom } from "../../store/shared/branch.ts";
import type { TBranch } from "../../types/branch.ts";
import type { ReadableAtom } from "nanostores";
import { API, type TResponse } from "../../lib/api.ts";
import type { TCurrency } from "../../types/currency.ts";
import { options_atom } from "../../store/client/options.ts";

interface TTotal {
	base: number;
	sub: number;
	vat: number;
	total: number;
}

type TOrderErrorData =
	| { type: null }
	//
	| { type: "DELIVERY_INVALID" }
	//
	| { type: "BRANCH_BAD_ID" }
	| { type: "BRANCH_CLOSED" }
	//
	| { type: "ITEM_NOT_FOUND"; cartId: string }
	| { type: "ITEMS_NOT_FOUND"; cartId: string[] }
	| { type: "ITEM_BAD_VERSION"; cartId: string }
	| { type: "ITEM_NOT_AVAILABLE"; cartId: string }
	//
	| { type: "CHOICE_NOT_FOUND"; cartId: string }
	| { type: "CHOICE_BAD_VERSION"; cartId: string }
	| { type: "CHOICE_BAD_VALUE"; cartId: string; id?: never }
	| { type: "CHOICE_BAD_VALUE"; id: string; cartId?: never }
	| { type: "CHOICE_NOT_AVAILABLE"; cartId: string }
	| {
			type: "CHOICE_TOO_LITTLE";
			cartId: string;
			expected: number;
			found: number;
	  }
	| {
			type: "CHOICE_TOO_MANY";
			cartId: string;
			expected: number;
			found: number;
	  }
	| { type: "CHOICE_REQUIRED"; cartId: string }
	//
	| { type: "OPTION_NOT_FOUND"; cartId: string; id: string }
	| { type: "OPTION_NOT_AVAILABLE"; cartId: string; id: string };

// response status: 200
type TResponseData200 = {
	errors: TOrderErrorData[];
	data: {
		currency: TCurrency;
		total: Omit<TTotal, "base"> & {
			/**
			 * not included in subtotal
			 * if null, then show an error message.
			 * as delivery could not be calculated.
			 * (also prevent creating an order)
			 */
			delivery: number | null;
		};
		option: Record<string, TTotal>;
		cart: Record<string, TTotal>;
	} | null;
};

// response status 400
type TResponseData400 = TOrderErrorData;

const calculateOrderRequestBodySchema = v.object({
	type: v.picklist(["pickup", "delivery"]),

	details: v.object({
		location: v.nullable(
			v.union([
				v.object({
					area: v.string(),
					latitude: v.number(),
					longitude: v.number(),
				}),
				v.object({
					latitude: v.number(),
					longitude: v.number(),
				}),
			]),
		),
	}),

	items: v.array(
		v.object({
			id: v.number(),
			cartId: v.pipe(v.string(), v.uuid()),
			version: v.number(),
			quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
			note: v.string(),
			choices: v.array(
				v.object({
					id: v.string(),
					cartId: v.pipe(v.string(), v.uuid()),
					version: v.number(),
					// option's id
					options: v.array(v.string()),
				}),
			),
		}),
	),
});
type A = v.InferInput<typeof calculateOrderRequestBodySchema>;

export function CartPage() {
	const options = useStore(options_atom());
	const cart_atom_ = cart_atom();
	const [cart, set_cart] = createSignal(cart_atom_.get(), { equals: false });

	const branch = useStore(branch_atom as ReadableAtom<TBranch>);

	const [calculation, actions] = createResource(async function calculate() {
		const service = options().service;
		if (service === null) {
			throw new Error();
		}

		await new Promise((r) => {
			setTimeout(r, 500);
		});

		const response = await API.post(
			`ecommerce/${branch().id}/order/calculate`,
			{
				json: {
					type: service,

					details: {
						location: null,
					},

					items: cart().map((item) => {
						return {
							id: item.id,
							version: item.version,
							cartId: item.cartId,
							note: item.note,
							quantity: item.quantity,
							choices: item.choices.map((choice) => {
								return {
									id: choice.id,
									cartId: choice.cartId,
									version: choice.version,
									options: choice.selected,
								};
							}),
						};
					}),
				} satisfies A,
			},
		);
		const data = await response.json<TResponse<TResponseData200>>();

		return data;
	});

	createEffect(() => {
		cart_atom_.set(cart());
		actions.refetch();
	});

	const currency_formatter = () => {
		const calc = calculation.latest ?? calculation();
		return calc?.data.data
			? get_currency_formatter(calc.data.data.currency)
			: get_currency_formatter(branch().region.currency);
	};

	return (
		<Show
			when={cart().length}
			fallback={
				<div>
					<div>Cart is empty!</div>
					<a href="/">
						<button type="button" class="btn">
							Add Items now!
						</button>
					</a>
				</div>
			}
		>
			<div
				class="card bg-base-200 m-8 flex"
				classList={{ "opacity-50": calculation.loading }}
			>
				<div class="card-body">
					<div class="flex justify-between">
						<div class="card-title">Cart</div>
						<Show when={calculation.loading}>
							<div class="loading" />
						</Show>
					</div>
					<div class="contents">
						<For each={cart()}>
							{(item, index) => (
								<div class="bg-base-300 card" data-index={index()}>
									<div class="flex justify-between p-2">
										<div class="flex gap-4">
											<div class="flex w-10 gap-1">
												<button
													type="button"
													class="btn btn-circle btn-xs btn-success btn-soft"
													onClick={() => {
														set_cart(
															cart().with(index(), {
																...item,
																quantity: item.quantity + 1,
															}),
														);
													}}
												>
													+
												</button>

												<button
													type="button"
													class="btn btn-circle btn-xs btn-error btn-soft"
													classList={{ hidden: item.quantity === 1 }}
													onClick={() => {
														set_cart(
															cart().with(index(), {
																...item,
																quantity: item.quantity - 1,
															}),
														);
													}}
												>
													-
												</button>

												<button
													type="button"
													class="btn btn-circle btn-xs btn-error btn-soft"
													classList={{ hidden: item.quantity !== 1 }}
													onClick={() => {
														set_cart(cart().toSpliced(index(), 1));
													}}
												>
													R
												</button>
											</div>
											<span>{item.quantity}x</span>
											<span class="font-semibold">{item.name.en}</span>
										</div>

										<div class="flex flex-col items-end">
											<Show
												when={item.offerPrice}
												fallback={
													<div>{currency_formatter()?.format(item.price)}</div>
												}
											>
												{(offerPrice) => (
													<div class="flex gap-4">
														<div class="line-through">
															{currency_formatter()?.format(item.price)}
														</div>
														<div>
															{currency_formatter()?.format(offerPrice())}
														</div>
													</div>
												)}
											</Show>

											<Show
												when={
													calculation.latest?.data.data?.cart[item.cartId].sub
												}
												fallback={<div class="loading" />}
											>
												{(v) => (
													<div class="font-semibold">
														{currency_formatter()?.format(v())}
													</div>
												)}
											</Show>
										</div>
									</div>

									<div>{item.note}</div>

									<For each={item.choices}>
										{(choice) => (
											<div class="ms-4 border-s py-1 ps-4 pe-2">
												<div class="flex justify-between">
													<div>{choice.name.en}</div>
													<Show
														when={
															calculation.latest?.data.data?.cart[choice.cartId]
																?.sub
														}
														fallback={<div class="loading" />}
													>
														{(v) => (
															<div class="font-semibold">
																{currency_formatter()?.format(v())}
															</div>
														)}
													</Show>
												</div>

												<For
													each={choice.selected}
													fallback={
														<div class="flex justify-between border-s py-1 ps-4 italic">
															No Option Selected
														</div>
													}
												>
													{(selected) => (
														<div class="flex justify-between border-s py-1 ps-4">
															<div>
																{
																	choice.options.find(
																		(option) => option.id === selected,
																	)?.name.en
																}
															</div>
															<Show
																when={
																	calculation.latest?.data.data?.option[
																		selected
																	]?.sub
																}
																fallback={<div class="loading" />}
															>
																{(v) => (
																	<div class="font-semibold">
																		{currency_formatter()?.format(v())}
																	</div>
																)}
															</Show>
														</div>
													)}
												</For>
											</div>
										)}
									</For>
								</div>
							)}
						</For>
					</div>

					<div class="flex justify-between">
						<div>Subtotal</div>
						<Show
							when={calculation.latest?.data.data?.total.sub}
							fallback={<div class="loading" />}
						>
							{(v) => <div>{currency_formatter()?.format(v())}</div>}
						</Show>
					</div>

					<Show when={calculation.latest?.data.data?.total.delivery}>
						{(delivery) => (
							<div class="flex justify-between">
								<div>Delivery</div>
								<div>{currency_formatter()?.format(delivery())}</div>
							</div>
						)}
					</Show>

					<div class="flex justify-between">
						<div>Vat</div>
						<Show
							when={calculation.latest?.data.data?.total.vat}
							fallback={<div class="loading" />}
						>
							{(v) => <div>{currency_formatter()?.format(v())}</div>}
						</Show>
					</div>

					<div class="flex justify-between">
						<div>Total</div>
						<Show
							when={calculation.latest?.data.data?.total.total}
							fallback={<div class="loading" />}
						>
							{(v) => <div>{currency_formatter()?.format(v())}</div>}
						</Show>
					</div>
				</div>
			</div>
		</Show>
	);
}
