import { createRouter } from "#lib/factory";
import { githubRouter } from "./github";

export const authRouter = createRouter().route("/github", githubRouter);
