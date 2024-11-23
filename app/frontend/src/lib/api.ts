import type { ApiType } from "@server/app";
import { hc } from "hono/client";

const { DEV } = import.meta.env;

const baseUrl = DEV ? "http://localhost:3000" : `${window.location.origin}`;

const { api } = hc<ApiType>(baseUrl, {
	init: {
		credentials: "include",
	},
});

export default api;
