import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export function SignoutButton() {
	return (
		<Button asChild>
			<a href={api.auth.signout.$url().toString()}>signout</a>
		</Button>
	);
}
