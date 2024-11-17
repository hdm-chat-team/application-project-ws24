import { GitHub } from "arctic";

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env;
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
	throw new Error("GitHub ClientId or ClientSecret must be set");
}
export const github = new GitHub(
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	"http://localhost:3000/test/login/github/callback",
);
