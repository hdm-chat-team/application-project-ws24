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
import { Separator } from "@/components/ui/separator";
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
			<Card className="relative flex px-5">
				<div className="flex-col items-center gap-2 py-4">
					<img
						src={Logo}
						className="-top-[2.75rem] -translate-x-1/2 absolute left-1/2 h-[5.5rem] w-auto"
						alt="Hdm-Logo"
					/>
					<CardHeader className="my-3">
						<CardTitle className="mt-2 text-center font-sans text-3xl">
							StudyConnect
						</CardTitle>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={(event) => {
								event.preventDefault();
								window.alert("submitted");
							}}
							className="mt-7 mb-5 flex flex-col gap-2"
						>
							<div className="flex gap-2">
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
					<Separator />
					<CardFooter className="flex w-full flex-col">
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
