import { useStore } from "@nanostores/solid";
import { Index, Show, createEffect, createSignal, onCleanup } from "solid-js";
import { options_atom as _options_atom } from "../../store/client/options.ts";
import { branch_atom } from "../../store/shared/branch.ts";
import { branches_atom } from "../../store/shared/branches.ts";
import { settings_atom } from "../../store/shared/settings.ts";

import TablerBuildingStore from "~icons/tabler/building-store";
import TablerMotorbike from "~icons/tabler/motorbike";
import TablerCaretDown from "~icons/tabler/caret-down";
import { branch_id_atom } from "../../store/shared/selected-branch.ts";

interface TopBarSelectorProps {
	force_open?: true;
	dialog_only?: true;
}

export function TopBarSelector(props: TopBarSelectorProps) {
	const settings = useStore(settings_atom);

	const branches = useStore(branches_atom);
	const branch = useStore(branch_atom);
	const [local_branch_id, set_local_branch_id] = createSignal(
		branch()?.id ?? branches()[0]?.id,
	);

	function selected_branch() {
		return branches().find((branch) => branch.id === local_branch_id());
	}

	const [options_atom, set_options_atom] = createSignal(
		_options_atom(local_branch_id()),
	);
	const [local_options, set_local_options] = createSignal(options_atom().get());
	createEffect(() => {
		const subscriber = options_atom().subscribe((value) => {
			set_local_options((current) => ({
				...value,
				modal_open: current.modal_open || value.modal_open,
			}));
		});

		onCleanup(() => {
			subscriber();
		});
	});

	createEffect(() => {
		set_options_atom(_options_atom(local_branch_id()));
	});

	return (
		<>
			<Show when={!props.dialog_only}>
				<button
					type="button"
					class="btn grid grid-cols-1 grid-rows-1"
					onClick={() => {
						set_local_options((value) => ({ ...value, modal_open: true }));
					}}
				>
					<span class="col-span-full row-span-full flex items-center group-hover:opacity-0">
						{selected_branch()?.branchName}
						<span class="mx-4">|</span>
						<span class="capitalize">{local_options().service}</span>
						<TablerCaretDown class="ms-2" />
					</span>
					<span class="col-span-full row-span-full not-group-hover:opacity-0">
						Change Options
					</span>
				</button>
			</Show>

			<dialog
				open={props.force_open || local_options().modal_open}
				class="modal"
			>
				<div class="modal-box">
					<div class="flex flex-col items-center justify-center gap-8">
						<div class="flex w-full items-center justify-between">
							<h2 class="card-title">
								<img class="h-10" src={settings().logo} alt="logo" />
								{settings().title.en}
							</h2>

							<fieldset class="fieldset">
								<legend class="fieldset-legend">Branch</legend>

								<select
									class="select w-full"
									value={local_branch_id()}
									onInput={(event) => {
										const id = Number.parseInt(event.currentTarget.value);
										if (!Number.isNaN(id)) {
											set_local_branch_id(id);
										}
									}}
								>
									<Index each={branches()}>
										{(item) => (
											<option value={item().id}>{item().branchName}</option>
										)}
									</Index>
								</select>
							</fieldset>
						</div>

						<fieldset class="fieldset">
							<legend class="fieldset-legend">Service</legend>

							<div class="flex items-center justify-center gap-4">
								<button
									type="button"
									class="btn flex h-full flex-col items-center justify-center p-6"
									classList={{
										"btn-primary": local_options().service === "pickup",
									}}
									disabled={
										!(
											selected_branch()?.ecommerce.services.pickup ??
											settings().services.pickup
										)
									}
									onClick={() => {
										set_local_options((value) => ({
											...value,
											service: "pickup",
										}));
									}}
								>
									<TablerBuildingStore class="text-[2.75rem]" />
									<span>Pickup</span>
								</button>

								<button
									type="button"
									class="btn flex h-full flex-col items-center justify-center p-6"
									classList={{
										"btn-primary": local_options().service === "delivery",
									}}
									disabled={
										!(
											selected_branch()?.ecommerce.services.delivery ??
											settings().services.delivery
										)
									}
									onClick={() => {
										set_local_options((value) => ({
											...value,
											service: "delivery",
										}));
									}}
								>
									<TablerMotorbike class="text-[2.75rem]" />
									<span>Delivery</span>
								</button>
							</div>
						</fieldset>
					</div>

					<div class="modal-action">
						<button
							type="button"
							class="btn"
							disabled={local_options().service === null}
							onClick={() => {
								options_atom().set({
									...local_options(),
									modal_open: false,
								});
								set_local_options((value) => ({
									...value,
									modal_open: false,
								}));

								if (
									local_branch_id() !== branch_id_atom.get() ||
									props.force_open
								) {
									location.href = `/api/select-branch?branch=${local_branch_id()}`;
								}
							}}
						>
							Next
						</button>
					</div>
				</div>
			</dialog>
		</>
	);
}
