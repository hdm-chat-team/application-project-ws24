import type { AppType } from "@application-project-ws24/backend/types";
import { hc } from "hono/client";

const { api } = hc<AppType>("http://localhost:3000"); // ! "/" resulted in an error

export const { rest: restApi, ws: socketApi } = api;
export default api;
