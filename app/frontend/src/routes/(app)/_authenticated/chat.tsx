import { Button } from "@/components/ui/button";
import { chatsQueryFn, chatsQueryOptions } from "@/features/chat/queries";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";

export const Route = createFileRoute("/(app)/_authenticated/chat")({
	loader: async ({ context: { queryClient } }) =>
		await queryClient.fetchQuery(chatsQueryOptions),
	component: () => <Chat />,
});

function Chat() {
	const preloadedChats = Route.useLoaderData();
	const chats = useLiveQuery(chatsQueryFn, []) ?? preloadedChats;

	return (
		<div>
			<ul>
				{chats.map(({ id, name }) => (
					<li key={id}>
						<div className="flex">
							<span>{name}</span>
							<Button variant="link" asChild>
								<Link to="/chat/$chatId" params={{ chatId: id }}>
									Open Chat
								</Link>
							</Button>
						</div>
					</li>
				))}
			</ul>
			<Outlet />
		</div>
	);
}
