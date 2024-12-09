import Logo from "@/assets/hdm-logo-clipart-lg.png";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";
import { Github } from "lucide-react";

export const Route = createFileRoute("/signin/")({
	component: SignIn,
	ssr: true,
});

function SignIn() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<Card className="flex px-10 md:px-20">
				<div className="-mt-4 relative flex w-[50rem] flex-col items-center gap-2 p-4 px-32">
					<img
						src={Logo}
						className="-mt-[2.75rem] h-[5.5rem] w-auto"
						alt="Hdm-Logo"
					/>
					<CardHeader>
						<CardTitle className="mt-2 font-sans text-3xl">
							StudyConnect
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								window.alert("submitted");
							}}
							className="mt-7 mb-5 flex flex-col gap-2"
						>
							<div className="flex gap-2 ">
								<h3 className="w-2/5">E-Mail</h3>
								<Input type="email" />
							</div>
							<div className="flex gap-2">
								<h3 className="w-2/5">Password</h3>
								<Input type="password" />
							</div>
							<div className="flex w-full justify-end">
								<Button className="w-fit rounded-3xl">Sign In</Button>
							</div>
						</form>
					</CardContent>
					<CardFooter className="flex w-full flex-col">
						<hr className="w-full border-gray-400" />
						<h1>or sign in with</h1>
						<div className="mt-5 flex w-full justify-center">
							<Button
								asChild
								className="flex items-center gap-2 rounded-3xl px-4 py-2"
							>
								<a href={api.auth.github.$url().toString()}>
									GitHub
									<Github />
								</a>
							</Button>
						</div>
					</CardFooter>
				</div>
			</Card>
		</div>
	);
}
