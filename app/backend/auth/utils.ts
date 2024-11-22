export function hashToken(token: string): string {
	const hasher = new Bun.CryptoHasher("sha256", Buffer.from("base64"));
	return hasher.update(token).digest("base64");
}
