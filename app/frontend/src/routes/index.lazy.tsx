import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import Logo from '@/assets/hdm-logo-clipart-lg.png'
import { Input } from "@/components/ui/input";
export const Route = createLazyFileRoute("/")({
	component: Index,
});
import { FaGithub } from "react-icons/fa";
function Index() {
	const [messages, setMessages] = useState<string[]>([]);
	const socketRef = useRef<WebSocket | null>(null);
	const [inputMessage, setInputMessage] = useState("");

	useEffect(() => {
		const socket = api.chat.$ws();
		socketRef.current = socket;

		socket.onopen = (event) => {
			console.log("WebSocket client opened", event);
		};

		socket.onmessage = (event) => {
			console.log("WebSocket client received message", event);
			setMessages((prevMessages) => [...prevMessages, event.data]);
		};

		return () => {
			socket.close();
		};
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (socketRef.current && inputMessage) {
			socketRef.current.send(inputMessage);
			setInputMessage("");
		}
	};

	const { data, isPending } = useQuery({
		queryKey: ["data"],
		queryFn: fetchData,
	});

	return (
		<div className="bg-white w-full h-[100vh] flex justify-center items-center px-10 md:px-20">
			<div className="bg-[#3E4746] w-[50rem]  rounded-xl p-4 flex flex-col items-center gap-2 px-32 -mt-4">
				<img src={Logo} className="h-[5.5rem] w-auto -mt-[2.75rem] " />
				<h1 className="text-3xl text-blue-300">
					{isPending ? "" : data}
				</h1>
				<div className="h-"></div>
				<div>
					<h2 className="font-sans text-3xl">StudyConnect</h2>
					{/* <ul>
						{messages.map((message) => (
							<li key={message}>{message}</li>
						))}
					</ul> */}
				</div>
				<form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-7">
					<div className="flex gap-2 ">
						<h3 className="w-2/5">
							E-mail
						</h3>
						<Input type="email" className="bg-[#919B9A]" />
					</div>
					<div className="flex gap-2">
						<h3 className="w-2/5">
							Password
						</h3>
						<Input type="password" className="bg-[#919B9A] text-white" />
					</div>
					<div className="flex w-full justify-end">
						<Button asChild className="bg-[#E51534] text-white rounded-3xl w-fit hover:bg-[#e51534b5]">
							<a href={api.auth.github.$url().toString()}>
								signin
							</a>
						</Button>
					</div>
				</form>

				<div className="flex w-full justify-start">
					<Button variant={'link'}>
						<a href={api.auth.signout.$url().toString()}>signout</a>
					</Button>
				</div>
				<hr className=" border-gray-400 w-full" />
				<h1 >
					or sign in with
				</h1>
				<div className="flex w-full justify-center mt-10">
					<Button asChild className="bg-[#E51534] text-white flex items-center gap-2 rounded-3xl px-4 py-2 hover:bg-[#e51534b5]">
						<a href={api.auth.github.$url().toString()}>

							GitHub <FaGithub />
						</a>
					</Button>
				</div>
			</div>
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