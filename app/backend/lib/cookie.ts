import env from "#env";

const cookieConfig = {
	path: "/",
	secure: env.NODE_ENV !== "development",
	httpOnly: true,
	sameSite: "lax" as const,
};

export default cookieConfig;
