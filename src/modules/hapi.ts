import { Server as wsServer } from "socket.io";

declare module "@hapi/hapi" {
	interface ServerApplicationState {
		io: wsServer;
	}
}