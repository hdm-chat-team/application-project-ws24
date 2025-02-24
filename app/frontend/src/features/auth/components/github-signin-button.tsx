import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { Github } from "lucide-react";

type GithubSignInButtonProps = {
	from?: string;
};

export function GithubSignInButton({ from }: GithubSignInButtonProps) {
	return (
		<Button asChild className="flex items-center gap-2 rounded-3xl px-4 py-2">
			<a href={api.auth.github.$url({ query: { from } }).toString()}>
				GitHub
				<Github />
			</a>
		</Button>
	);
}
