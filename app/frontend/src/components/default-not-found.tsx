import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link, useLocation } from "@tanstack/react-router";

export default function DefaultNotFound() {
	const location = useLocation();

	return (
		<div className="flex h-screen w-full items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-center text-3xl">404</CardTitle>
					<CardDescription className="text-center text-lg">
						Oops!
						<br />
						<code className="rounded bg-muted px-1">{location.pathname}</code>
						<br />
						could not be found.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex justify-center gap-4">
					<Button variant="outline" onClick={() => window.history.back()}>
						Go Back
					</Button>
					<Button asChild>
						<Link to="/">Return to Home</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
