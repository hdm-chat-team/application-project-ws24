import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
	component: Index,
});

function Index() {
	const ws = api.ws.$ws();

	ws.addEventListener("open", () => {
		ws.send("Hello from client!");
	});

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
	const response = await api.$get();
	if (!response.ok) {
		throw new Error("Failed to fetch data");
	}
	return response.text();
}
