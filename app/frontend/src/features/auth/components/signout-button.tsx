import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export function SignoutButton() {
	const from = window.location.href;
	return (
		<Button asChild>
			<a href={api.auth.signout.$url({ query: { from } }).toString()}>
				signout
			</a>
		</Button>
	);
}
