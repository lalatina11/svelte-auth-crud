import { redirect } from "@sveltejs/kit";
import type { RequestEvent } from "../$types";

export const load = async ({ cookies }: RequestEvent) => {
    const userToken = cookies.get("user_token")
    if (!userToken) {
        return { data: null }
    } else {
        return redirect(301, "/")
    }
}