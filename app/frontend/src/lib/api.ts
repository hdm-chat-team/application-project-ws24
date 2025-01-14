import type { ApiType } from "@server/api/app";
import { hc } from "hono/client";

const { DEV } = import.meta.env;
const baseUrl = DEV ? "http://localhost:3000" : `${window.location.origin}`;
const credentials: RequestCredentials = DEV ? "include" : "same-origin";

const { api } = hc<ApiType>(baseUrl, {
	init: {
		credentials,
	},
});

export default api;
export { api };
