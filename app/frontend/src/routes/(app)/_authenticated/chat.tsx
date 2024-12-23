import { Button } from "@/components/ui/button";
import { userChatsQueryOptions } from "@/features/chat/queries";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/_authenticated/chat")({
	loader: async ({ context: { queryClient } }) =>
		await queryClient.ensureQueryData(userChatsQueryOptions),
	component: () => <Chat />,
});

function Chat() {
	const chats = Route.useLoaderData();
	return (
		<div>
			<ul>
				{chats.map((chat) => (
					<li key={chat.id}>
						<div className="flex">
							<span>{chat.name}</span>
							<Button variant="link" asChild>
								<Link to="/chat/$id" params={{ id: chat.id }}>
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
