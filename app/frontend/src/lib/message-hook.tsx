import { useEffect } from 'react';
import { useAuthContext } from '../lib/auth-context';
import { MessageService } from '../lib/message-service';

export function useMessageService() {
    const user = useAuthContext();
    const messageService = MessageService.getInstance();

    // biome-ignore lint/correctness/useExhaustiveDependencies: MessageService is a singleton
    useEffect(() => {
        messageService.setCurrentUser(user);
    }, [user]);

    return messageService;
}