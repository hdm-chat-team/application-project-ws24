import { useUser } from "@/features/auth";
import { SignoutButton } from "@/features/auth/components/signout-button";
import { useSocket } from "@/hooks/use-socket";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/(app)/_authenticated/")({
	component: Index,
});

// TODO: Implement logic so messages are loaded from the database

function Index() {
	const { user } = useUser();
	const { readyState } = useSocket();

	const { data, isPending } = useQuery({
		queryKey: ["data"],
		queryFn: fetchData,
	});

	return (
		<div>
			<h1 className="text-3xl text-blue-300">
				{isPending ? "Loading..." : data}
			</h1>
			<h1>You are logged in as: {user?.username} </h1>
			<h2>Socket Status: {readyState}</h2>
			<SignoutButton />
		</div>
	);
}

async function fetchData() {
	const response = await api.$get();
	if (!response.ok) {
		throw new Error("Failed to fetch data");
	}
	return response.text();
}
