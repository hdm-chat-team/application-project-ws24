import { GitHub } from "arctic";
import env from "#env";

export const github = new GitHub(
	env.CLIENT_ID_GITHUB,
	env.CLIENT_SECRET_GITHUB,
	env.CALLBACK_URL_GITHUB,
);
