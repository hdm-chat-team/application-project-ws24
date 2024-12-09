import { DEV } from "#env";

const cookieConfig = {
	path: "/",
	secure: !DEV,
	httpOnly: true,
	sameSite: "lax" as const,
};

export default cookieConfig;
