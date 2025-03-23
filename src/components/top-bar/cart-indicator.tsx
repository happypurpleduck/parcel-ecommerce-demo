import { useStore } from "@nanostores/solid";
import { Show } from "solid-js";
import { cart_atom } from "../../store/client/cart.ts";

export function TopBarCartIndicator() {
	const _cart = cart_atom();
	const cart = useStore(cart_atom());

	_cart.listen(console.log);

	return (
		<Show when={cart().length}>
			{(length) => (
				<span class="badge badge-xs indicator-item">{length()}</span>
			)}
		</Show>
	);
}
