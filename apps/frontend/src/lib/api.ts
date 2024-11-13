import type { AppType } from "@application-project-ws24/backend/client";
import { hc } from "hono/client";

const { api } = hc<AppType>("http://localhost:3000"); // ! "/" resulted in an error

export default api;
