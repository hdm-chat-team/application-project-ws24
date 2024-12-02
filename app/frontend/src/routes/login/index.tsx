import Logo from "@/assets/hdm-logo-clipart-lg.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { useRef, useState } from "react";
export const Route = createFileRoute("/login/")({
	component: Index,
});
function Index() {
	const socketRef = useRef<WebSocket | null>(null);
	const [inputMessage, setInputMessage] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (socketRef.current && inputMessage) {
			socketRef.current.send(inputMessage);
			setInputMessage("");
		}
	};

	return (
		<div className="flex h-[100vh] w-full items-center justify-center bg-white px-10 md:px-20">
			<div className="-mt-4 flex w-[50rem] flex-col items-center gap-2 rounded-xl bg-secondary p-4 px-32">
				<img
					src={Logo}
					className="-mt-[2.75rem] h-[5.5rem] w-auto "
					alt="Hdm-Logo"
				/>

				<div className="h-" />
				<div>
					<h2 className="font-sans text-3xl">StudyConnect</h2>
				</div>
				<form onSubmit={handleSubmit} className="mt-7 mb-5 flex flex-col gap-2">
					<div className="flex gap-2 ">
						<h3 className="w-2/5">E-Mail</h3>
						<Input type="email" className="bg-primary-foreground" />
					</div>
					<div className="flex gap-2">
						<h3 className="w-2/5">Password</h3>
						<Input
							type="password"
							className="bg-primary-foreground text-white"
						/>
					</div>
					<div className="flex w-full justify-end">
						<Button
							asChild
							className="w-fit rounded-3xl bg-destructive text-white hover:bg-destructive/80 "
						>
							<a href={api.auth.github.$url().toString()}>Sign In</a>
						</Button>
					</div>
				</form>

				{/*<div className="flex w-full justify-start">
					<Button asChild variant="link">
						<a href={api.auth.signout.$url().toString()}>signout</a>
					</Button>
				</div>*/}
				<hr className=" w-full border-gray-400" />
				<h1>or sign in with</h1>
				<div className="mt-5 flex w-full justify-center">
					<Button
						asChild
						className="flex items-center gap-2 rounded-3xl bg-destructive px-4 py-2 text-white hover:bg-destructive/80"
					>
						<a href={api.auth.github.$url().toString()}>
							GitHub
							<Github />
						</a>
					</Button>
				</div>
			</div>
		</div>
	);
}
