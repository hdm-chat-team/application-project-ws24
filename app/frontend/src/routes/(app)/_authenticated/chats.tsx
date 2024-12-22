import { userChatsQueryOptions } from "@/features/chat/queries";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/_authenticated/chats")({
	component: RouteComponent,
	loader: async ({ context: { queryClient } }) =>
		await queryClient.ensureQueryData(userChatsQueryOptions),
});

function RouteComponent() {
	const chats = Route.useLoaderData();
	return <pre>{JSON.stringify(chats, null, 2)}</pre>;
}
