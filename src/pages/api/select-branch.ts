import type { APIContext } from "astro";

export async function GET(context: APIContext) {
	const form = context.url.searchParams;
	console.log("from", form);

	const form_branch_id = form.get("branch");
	if (typeof form_branch_id !== "string") {
		return context.redirect("/");
	}

	const branch_id = Number.parseInt(form_branch_id);
	if (Number.isNaN(branch_id)) {
		return context.redirect("/");
	}

	context.session?.set("branch", branch_id);

	return context.redirect("/");
	// return context.redirect(`/${branch_id}`);
}
