import { type Message, messageDb } from "@/features/db";

// * MessageService singleton for managing messages
class MessageService {
	private static instance: MessageService;
	private constructor() {
		console.log("MessageService instance created");
	}

	public static getInstance() {
		if (!MessageService.instance) {
			MessageService.instance = new MessageService();
		}
		return MessageService.instance;
	}

	private createMessage(content: string, userId: string): Message {
		return {
			id: crypto.randomUUID(),
			content,
			timestamp: Date.now(),
			userId,
		};
	}

	public async addSentMessage(content: string, userId: string): Promise<void> {
		const message = this.createMessage(content, userId);
		await this.addMessage(message);
	}

	public async addReceivedMessage(content: string, userId: string) {
		const message = this.createMessage(content, userId);
		await this.addMessage(message);
	}

	private async addMessage(message: Message) {
		try {
			await messageDb.table("messages").add(message);
		} catch (error) {
			console.error("Error adding message to database:", error);
			throw new Error("Error adding message to database");
		}
	}

	// Generate a pair of RSA keys
	public async generateKeyPair() {
		const keyPair = await window.crypto.subtle.generateKey(
			{
				name: "RSA-OAEP",
				modulusLength: 2048,
				publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
				hash: "SHA-256",
			},
			true,
			["encrypt", "decrypt"],
		);
		return keyPair;
	}

	// Export the public key as a string
	public async exportPublicKey(key: CryptoKey) {
		const exported = await window.crypto.subtle.exportKey("spki", key);
		return btoa(String.fromCharCode(...new Uint8Array(exported)));
	}

	// Encrypt a message using the recipient's public key
	public async encryptMessage(message: string, publicKey: string) {
		const key = await window.crypto.subtle.importKey(
			"spki",
			Uint8Array.from(atob(publicKey), (c) => c.charCodeAt(0)),
			{
				name: "RSA-OAEP",
				hash: "SHA-256",
			},
			false,
			["encrypt"],
		);

		const encrypted = await window.crypto.subtle.encrypt(
			{ name: "RSA-OAEP" },
			key,
			new TextEncoder().encode(message),
		);

		return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
	}

	// Decrypt a message using the user's private key
	public async decryptMessage(encryptedMessage: string, privateKey: CryptoKey) {
		const decrypted = await window.crypto.subtle.decrypt(
			{ name: "RSA-OAEP" },
			privateKey,
			Uint8Array.from(atob(encryptedMessage), (c) => c.charCodeAt(0)),
		);

		return new TextDecoder().decode(decrypted);
	}
}

export { messageDb, MessageService };
