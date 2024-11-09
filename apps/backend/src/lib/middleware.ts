import { HTTPException } from "hono/http-exception";

export const errorHandler = async (error: Error) => {
	if (!(error instanceof HTTPException)) {
		return new Response(error.message, {
			status: 500,
			statusText: `Internal error: ${error.cause}`,
		});
	}
	return error.getResponse();
};
