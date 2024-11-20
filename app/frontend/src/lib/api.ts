import type { ApiType } from "@server/client";
import { hc } from "hono/client";

const { api } = hc<ApiType>(window.location.origin);

export default api;
