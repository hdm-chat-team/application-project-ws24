import api from "@/lib/api";
import {
	type ClientToServerWsEventData,
	type ServerToClientWsEventData,
	clientToServerWsEventDataSchema,
	serverToClientWsEventData,
} from "@shared/types";

const connectionStates = ["disconnected", "connecting", "connected"] as const;
type ConnectionState = (typeof connectionStates)[number];

/**
 * Manages WebSocket connections with automatic reconnection capabilities and message validation.
 */
export default class WebSocketService {
	private socket: WebSocket | null = null;
	private onMessageCallback: (
		data: ServerToClientWsEventData,
		sendMessage: (message: ClientToServerWsEventData) => void,
	) => void;

	// Reconnection config
	private connectionState: ConnectionState = "disconnected";
	private currentTimeoutId: number | null = null;
	private reconnectTimeoutId: number | null = null;
	private reconnectAttempt = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;
	private connectionTimeout = 5000; // Timeout for initial connection

	constructor(
		onMessage: (
			data: ServerToClientWsEventData,
			sendMessage: (message: ClientToServerWsEventData) => void,
		) => void,
	) {
		this.onMessageCallback = onMessage;
	}

	/**
	 * Gets the current ready state of the WebSocket connection
	 */
	public get readyState() {
		return this.socket?.readyState || WebSocket.CONNECTING;
	}

	/**
	 * Establishes a connection to the WebSocket server.
	 * @private
	 */
	public connect() {
		if (this.connectionState !== "disconnected") {
			console.warn(
				`Already ${this.connectionState}, ignoring connect request.`,
			);
			return;
		}

		this.connectionState = "connecting";
		this.disconnect(); // Cleanup any existing connection

		try {
			this.initializeWebSocket();
		} catch (error) {
			console.error("Failed to initialize WebSocket:", error);
			this.handleConnectionFailure();
		}
	}

	/**
	 * Initializes the WebSocket instance and sets up event handlers.
	 * @private
	 */
	private initializeWebSocket() {
		this.socket = api.socket.$ws(); // ? maybe this should be configurable

		this.socket.onopen = () => {
			console.log("WebSocket connected successfully");
			this.handleConnectionSuccess();
		};

		this.socket.onclose = (event: CloseEvent) => {
			console.log("WebSocket disconnected:", event.reason);
			this.handleConnectionFailure();
		};

		this.socket.onerror = (event: Event) => {
			console.error("WebSocket error:", event);
			this.handleConnectionFailure();
		};

		// Bind the sendMessage function here
		const boundOnMessageCallback = (data: ServerToClientWsEventData) => {
			if (this.onMessageCallback) {
				this.onMessageCallback(data, this.sendMessage.bind(this));
			}
		};

		this.socket.onmessage = (event: MessageEvent) => {
			const object = JSON.parse(event.data);
			const { data, error } = serverToClientWsEventData.safeParse(object);
			if (error) {
				console.error("Error validating incoming message:", error);
				return;
			}
			boundOnMessageCallback(data);
		};

		// Set up connection timeout
		this.setupConnectionTimeout();
	}

	private handleConnectionSuccess() {
		this.connectionState = "connected";
		this.reconnectAttempt = 0;
		this.clearTimeouts();
	}

	private handleConnectionFailure() {
		this.connectionState = "disconnected";
		this.clearTimeouts();
		this.reconnect();
	}

	private clearTimeouts() {
		if (this.currentTimeoutId !== null) {
			window.clearTimeout(this.currentTimeoutId);
			this.currentTimeoutId = null;
		}
		if (this.reconnectTimeoutId !== null) {
			window.clearTimeout(this.reconnectTimeoutId);
			this.reconnectTimeoutId = null;
		}
	}

	/**
	 * Closes the WebSocket connection and cleans up resources.
	 */
	public disconnect() {
		this.clearTimeouts();
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}
		this.connectionState = "disconnected";
	}

	/**
	 * Sends a message through the WebSocket connection.
	 * @param message - The message to send, must conform to WSEventData schema
	 */
	public sendMessage(message: ClientToServerWsEventData) {
		// Check if the socket is connected
		if (!(this.socket && this.socket.readyState === WebSocket.OPEN)) {
			console.error("WebSocket is not connected.");
			return;
		}

		// Validate the message using your Zod schema
		const { error } = clientToServerWsEventDataSchema.safeParse(message);
		if (error) {
			console.error("Error validating outgoing message:", error);
			return;
		}

		// Send the message
		this.socket.send(JSON.stringify(message));
	}

	/**
	 * Attempts to reconnect to the WebSocket server using exponential backoff.
	 * @private
	 */
	private reconnect() {
		if (this.reconnectAttempt >= this.maxReconnectAttempts) {
			console.warn("Max reconnection attempts reached");
			return;
		}

		const delayMs = this.calculateReconnectDelay();
		this.reconnectAttempt++;

		this.reconnectTimeoutId = window.setTimeout(() => {
			if (this.connectionState === "disconnected") {
				this.connect();
			}
		}, delayMs);
	}

	/**
	 * Calculates the delay before the next reconnection attempt using exponential backoff with jitter.
	 * @returns The delay in milliseconds
	 * @private
	 */
	private calculateReconnectDelay() {
		const baseDelay = Math.min(
			this.reconnectDelay * 2 ** this.reconnectAttempt,
			10000,
		);
		const jitter = Math.random() * 1000;
		return baseDelay + jitter;
	}

	/**
	 * Sets up connection timeout to prevent hanging connections.
	 * @private
	 */
	private setupConnectionTimeout() {
		this.currentTimeoutId = window.setTimeout(() => {
			if (this.socket?.readyState === WebSocket.CONNECTING) {
				console.warn("Connection timeout reached. Closing socket.");
				this.socket.close();
			}
		}, this.connectionTimeout);
	}
}
