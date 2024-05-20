"use client";

import { io, Socket } from "socket.io-client";
import {ServerToClientEvents, ClientToServerEvents} from "../../../socket-types";

export interface SocketInterface {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
}

class SocketConnection implements SocketInterface {
    public socket: Socket<ServerToClientEvents, ClientToServerEvents>
    public socketEndpoint = process.env.SOCKET_URL as string
    constructor() {
        this.socket = io(this.socketEndpoint)
        console.log('Socket connected!')
    }
}

let socketConnection: SocketConnection | undefined

class SocketFactory {
    public static create(): SocketConnection {
        if (!socketConnection) {
            socketConnection = new SocketConnection()
        }
        return socketConnection
    }
}

export default SocketFactory