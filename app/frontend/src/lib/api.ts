import type { ApiType } from "@server/client";
import { hc } from "hono/client";

const { api } = hc<ApiType>("http://127.0.0.1:3000");

export default api;
