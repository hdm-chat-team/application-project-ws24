import type { ApiType } from "@server/client";
import { hc } from "hono/client";

const { api } = hc<ApiType>("http://localhost:3000"); // ! "/" resulted in an error

export default api;
