import { GitHub } from "arctic";

// @ts-ignore
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
	throw new Error("GitHub ClientId or ClientSecret must be set");
}
export const github = new GitHub(
	// @ts-ignore
	process.env.GITHUB_CLIENT_ID,
	// @ts-ignore
	process.env.GITHUB_CLIENT_SECRET,
	"http://localhost:3000/test/login/github/callback",
);
