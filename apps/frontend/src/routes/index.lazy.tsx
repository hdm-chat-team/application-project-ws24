import api from "@/lib/api";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createLazyFileRoute("/")({
	component: Index,
});

function Index() {
	const [data, setData] = useState<string>("");

	useEffect(() => {
		api
			.$get()
			.then((response) => response.text())
			.then((text) => setData(text))
			.catch((error) => console.error("Failed to fetch data:", error));
	}, []);

	return <h1 className="text-3xl text-blue-300">{data || "Loading..."}</h1>;
}
