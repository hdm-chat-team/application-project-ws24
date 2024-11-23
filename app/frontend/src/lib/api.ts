import type { ApiType } from "@server/app";
import { hc } from "hono/client";

const { api } = hc<ApiType>("http://localhost:3000", {
	init: {
		credentials: "include",
	},
});

export default api;
