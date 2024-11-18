import { GitHub } from "arctic";

const { CLIENT_ID_GITHUB, CLIENT_SECRET_GITHUB } = process.env;
if (!CLIENT_ID_GITHUB || !CLIENT_SECRET_GITHUB) {
	throw new Error("GitHub ClientId and ClientSecret must be set");
}

export const github = new GitHub(
	CLIENT_ID_GITHUB,
	CLIENT_SECRET_GITHUB,
	"http://localhost:3000/test/login/github/callback",
);
