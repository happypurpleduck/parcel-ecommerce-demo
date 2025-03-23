import { useStore } from "@nanostores/solid";
import { createForm } from "@tanstack/solid-form";
import { Index, Show, type JSXElement } from "solid-js";
import * as v from "valibot";
import { get_currency_formatter } from "../../lib/formatter.ts";
import { cart_atom as _cart_atom } from "../../store/client/cart.ts";
import type { TCurrency } from "../../types/currency.ts";
import type { TItem } from "../../types/item.ts";

interface ItemModalFromProps {
	branch_id: number;
	item: TItem;
	currency: TCurrency;

	children: JSXElement;
}

export function ItemModalForm(props: ItemModalFromProps) {
	const currencyFormatter = get_currency_formatter(props.currency);

	const cart_atom = _cart_atom();
	const cart = useStore(cart_atom);

	const localizedStringSchema = v.object({
		en: v.string(),
		ar: v.string(),
	});

	function defaultValues() {
		return {
			...props.item,

			cartId: crypto.randomUUID() as string,
			note: "",
			quantity: 1,

			choices: props.item.choices.map((choice) => {
				return {
					...choice,
					selected: [],
					cartId: crypto.randomUUID(),
				};
			}),
		} as v.InferOutput<typeof schema>;
	}

	const schema = v.object({
		cartId: v.pipe(v.string(), v.uuid()),
		note: v.string(),
		quantity: v.number(),

		id: v.number(),
		version: v.number(),
		name: localizedStringSchema,
		description: localizedStringSchema,
		image: v.array(v.string()),
		price: v.number(),
		offerPrice: v.nullable(v.number()),
		isAvailable: v.boolean(),

		choices: v.tuple(
			props.item.choices.map((choice) =>
				v.intersect([
					v.object({
						id: v.string(),
						version: v.number(),
						name: localizedStringSchema,
						description: localizedStringSchema,
						options: v.array(
							v.object({
								id: v.string(),
								name: localizedStringSchema,
								price: v.number(),
								offerPrice: v.nullable(v.number()),
								isAvailable: v.boolean(),
							}),
						),

						cartId: v.pipe(v.string(), v.uuid()),
						selected: v.pipe(
							v.array(v.string()),
							v.minLength(
								choice.multiple ? choice.min : choice.required ? 1 : 0,
							),
							v.maxLength(
								choice.multiple ? (choice.max ?? Number.MAX_SAFE_INTEGER) : 1,
							),
						),
					}),
					v.union([
						v.object({
							multiple: v.literal(true),
							required: v.null(),
							min: v.number(),
							max: v.nullable(v.number()),
						}),
						v.object({
							multiple: v.literal(false),
							required: v.boolean(),
							min: v.null(),
							max: v.null(),
						}),
					]),
				]),
			),
		),
	});

	const form = createForm(() => {
		return {
			validators: {
				onChange: schema,
				onSubmit: schema,
			},

			defaultValues: defaultValues(),

			onSubmit(submit) {
				cart_atom.set((cart() ?? []).concat([submit.value]));

				form.reset(defaultValues());

				const dialog = document.getElementById(
					`item_modal_${props.item.id}`,
				) as HTMLDialogElement | null;
				dialog?.close();
			},
			onSubmitInvalid(props) {
				console.error("e", props.formApi.getAllErrors());
			},
		};
	});

	const formErrorMap = form.useStore((state) => state.errorMap);

	return (
		<form
			class="modal-box absolute left-0 flex min-h-screen min-w-[calc(100vw-var(--scrollbar))] flex-col p-0 sm:static sm:left-auto sm:min-h-auto sm:min-w-auto 2xl:max-w-[48rem]"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				form.handleSubmit();
			}}
		>
			{props.children}

			<div class="flex flex-col overflow-y-auto" onSubmit={console.log}>
				<div class="divide-y">
					<form.Field name="choices" mode="array">
						{(choices_field) => (
							<Index each={choices_field().state.value}>
								{(choice, choice_index) => (
									<div class="card">
										<div class="card-body bg-base-300 flex-col p-4">
											<div class="flex justify-between gap-4">
												<div class="card-title">{choice().name.en}</div>
												<div>
													{choice().multiple
														? choice().max == null
															? `Mininum: ${choice().min}`
															: `Mininum: ${choice().min} | Maximum: ${choice().max}`
														: choice().required
															? "Required"
															: "Optional"}
												</div>
											</div>

											<p>{choice().description.en}</p>

											<Index each={choice().options}>
												{(option, i) => (
													<form.Field
														name={`choices[${choice_index}].selected`}
													>
														{(field) => (
															<label class="fieldset-label">
																<Show when={choice().multiple}>
																	<input
																		type="checkbox"
																		class="checkbox"
																		checked={field().state.value.some(
																			(selected) => selected === option().id,
																		)}
																		onInput={() => {
																			const f = field();
																			const index = f.state.value.findIndex(
																				(selected) => selected === option().id,
																			);
																			if (index >= 0) {
																				f.removeValue(index);
																			} else {
																				f.pushValue(option().id);
																			}
																		}}
																	/>
																</Show>

																<Show when={!choice().multiple}>
																	<input
																		onInput={() => {
																			const f = field();

																			if (f.state.value[0] !== option().id) {
																				field().replaceValue(0, option().id);
																			} else {
																				f.setValue([]);
																			}
																		}}
																		type="checkbox"
																		class="radio"
																		checked={
																			field().state.value[0] === option().id
																		}
																	/>
																</Show>

																<div class="flex flex-1 justify-between">
																	<span>{option().name.en}</span>
																	<span>
																		{currencyFormatter.format(option().price)}
																	</span>
																</div>
															</label>
														)}
													</form.Field>
												)}
											</Index>

											<Show when={formErrorMap().onSubmit}>
												{(errors) => (
													<div role="alert" class="alert alert-error">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															class="h-6 w-6 shrink-0 stroke-current"
															fill="none"
															viewBox="0 0 24 24"
														>
															<title>alert error icon</title>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
															/>
														</svg>
														<span>
															{errors()
																[`choices[${choice_index}].selected`]?.map(
																	(error) => error.message,
																)
																.join(", ")}
														</span>
													</div>
												)}
											</Show>
										</div>
									</div>
								)}
							</Index>
						)}
					</form.Field>
				</div>

				<form.Field name="note">
					{(field) => (
						<fieldset class="fieldset px-4">
							<legend class="fieldset-legend">Note</legend>
							{/* TODO: text area */}
							<input
								type="text"
								class="input w-full"
								value={field().state.value}
								onInput={(event) => field().setValue(event.currentTarget.value)}
							/>
						</fieldset>
					)}
				</form.Field>
			</div>

			<div class="flex w-full flex-col gap-4 p-4 shadow-inner md:flex-row md:gap-8">
				<form.Field name="quantity">
					{(field) => (
						<label class="input w-auto">
							<span class="label">Quantity</span>
							<input
								type="number"
								min="1"
								max="999"
								class="field-sizing-content w-auto"
								value={field().state.value}
								onInput={(event) =>
									field().setValue(Number(event.currentTarget.value))
								}
							/>
						</label>
					)}
				</form.Field>

				<button type="submit" class="btn btn-primary ms-auto px-8">
					Add to Kart
				</button>
			</div>
		</form>
	);
}
