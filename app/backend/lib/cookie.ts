import env from "#env";

const cookieConfig = {
	path: "/",
	secure: env.NODE_ENV !== "development",
	httpOnly: env.NODE_ENV !== "development",
	sameSite: "lax" as const,
	domain: env.NODE_ENV === "development" ? "localhost" : ".example.com",
};

export default cookieConfig;
