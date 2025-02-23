import { Button } from "@/components/ui/button";
import logo from "@assets/hdmChat.svg";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="min-h-screen px-8 py-6">
			<header className="mb-12 flex items-center justify-between">
				<img src={logo} alt="Study Connect Logo" className="h-28 w-auto" />
				<Button
					variant="outline"
					className="rounded-full border border-sidebar-primary px-4 py-2 text-sidebar-primary transition hover:bg-sidebar-primary hover:text-white"
					onClick={() => window.history.back()}
				>
					Return
				</Button>
			</header>

			<main className="mx-auto max-w-3xl text-left">
				<h1 className="mb-6 font-bold text-4xl">About Study Connect</h1>
				<p className="mb-6 text-lg">
					The Study Connect app was launched as part of the
					<a
						href="https://www.hdm-stuttgart.de/vorlesung_detail?vorlid=5215496"
						className="mx-2 text-sidebar-primary hover:underline"
					>
						Application Project
					</a>
					and{" "}
					<a
						href="https://www.hdm-stuttgart.de/"
						className="text hover:underline"
					>
						Software Project
					</a>
					, and was founded by our team.
				</p>
				<p className="mb-6 text-lg">
					Check out the source code on
					<a
						href="https://github.com/hdm-chat-team/application-project-ws24"
						className="mx-2 text-sidebar-primary hover:underline"
					>
						GitHub
					</a>
					.
				</p>
				<p className="mb-6 text-lg">
					<strong>The messenger app for your studies.</strong>
				</p>
				<h2 className="mt-8 mb-4 font-bold text-2xl">Our App</h2>
				<p className="mb-6 text-lg">
					Study Connect connects students from the
					<a
						href="https://www.hdm-stuttgart.de/"
						className="mx-2 text-sidebar-primary hover:underline"
					>
						Hochschule der Medien
					</a>
					on one platform. Whether individual or group chats – everything is in
					one place. With our app, you can easily communicate with your fellow
					students, share study materials, and stay organized.
				</p>
				<ul className="list-inside list-disc space-y-2 text-lg">
					<li>Stay connected with your fellow students at HdM</li>
					<li>Individual and group chats – all in one place</li>
					<li>File sharing – exchange ideas and study materials</li>
					<li>Intuitive user interface for easy and efficient studying</li>
					<li>Secure and reliable – your data remains protected</li>
				</ul>

				<h2 className="mt-8 mb-4 font-bold text-2xl">Our Team</h2>
				<ul className="list-inside list-disc space-y-2 text-lg">
					<li>
						<a
							href="https://github.com/DenizGazitepe"
							className="text-sidebar-primary hover:underline"
						>
							Deniz Gazitepe
						</a>
					</li>
					<li>
						<a
							href="https://github.com/bastianseibel"
							className="text-sidebar-primary hover:underline"
						>
							Bastian Seibel
						</a>
					</li>
					<li>
						<a
							href="https://github.com/arslanbri"
							className="text-sidebar-primary hover:underline"
						>
							Biran Arslan
						</a>
					</li>
					<li>
						<a
							href="https://github.com/sabrinaturni"
							className="text-sidebar-primary hover:underline"
						>
							Sabrina Turni
						</a>
					</li>
					<li>
						<a
							href="https://github.com/madinapoli"
							className="text-sidebar-primary hover:underline"
						>
							Maria Alyssa Di Napoli
						</a>
					</li>
				</ul>
			</main>
		</div>
	);
}
