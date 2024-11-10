import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createLazyFileRoute("/")({
	component: Index,
});

function Index() {
	useEffect(() => {
		const socket = api.ws.$ws();

		socket.onopen = (event) => {
			console.log("WebSocket client opened", event);
		};

		return () => {
			socket.close();
		};
	}, []);

	const { data, isPending } = useQuery({
		queryKey: ["data"],
		queryFn: fetchData,
	});

	return (
		<h1 className="text-3xl text-blue-300">
			{isPending ? "Loading..." : data}
		</h1>
	);
}

async function fetchData() {
	const response = await api.rest.$get();
	if (!response.ok) {
		throw new Error("Failed to fetch data");
	}
	return response.text();
}
