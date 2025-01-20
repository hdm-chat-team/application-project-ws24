import { SidebarTrigger } from "@/components/ui/sidebar";

export function ChatHeader() {
	/* 
	TODO: add chat information (name, participants, etc.)
	TODO: add action buttons 
	*/
	return (
		<header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
			<SidebarTrigger className="-ml-1" />
		</header>
	);
}
