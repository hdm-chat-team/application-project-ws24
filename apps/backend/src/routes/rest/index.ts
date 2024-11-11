import { Hono } from "hono";

export const rest = new Hono().get("/", (c) => {
	return c.text("Hello Hono!");
});
