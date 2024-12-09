import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

export default function DefaultNotFound() {
	return (
		<div className="flex h-screen w-full items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-center text-3xl">404</CardTitle>
					<CardDescription className="text-center text-lg">
						Oops! Page not found
					</CardDescription>
				</CardHeader>
				<CardContent className="flex justify-center">
					<Button asChild>
						<Link to="/">Return to Home</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
