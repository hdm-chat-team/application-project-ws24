const { NODE_ENV, ALLOWED_ORIGINS } = Bun.env;

const isDev = NODE_ENV === "development";

const origin = isDev
	? ["http://localhost:5173"]
	: (ALLOWED_ORIGINS?.split(",").map((o) => {
			const origin = o.trim();
			if (!origin.startsWith("https://")) {
				throw new Error("Production origins must use HTTPS");
			}
			return origin;
		}) ?? []);

export const config = {
	cors: {
		origin,
		credentials: !isDev,
		methods: ["GET", "POST", "PUT", "DELETE"],
		maxAge: isDev ? undefined : 3600,
	},
};
