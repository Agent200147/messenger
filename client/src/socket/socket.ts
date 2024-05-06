"use client";
import { io, Socket } from "socket.io-client";

export interface SocketInterface {
    socket: Socket
}

class SocketConnection implements SocketInterface {
    public socket: Socket;
    public socketEndpoint = process.env.SOCKET_URL as string
    constructor() {
        this.socket = io(this.socketEndpoint)
        console.log('second socket connected')
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