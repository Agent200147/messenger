import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface SocketState {
    isConnected: boolean;
    rooms: string[];
}

const initialState: SocketState = {
    isConnected: false,
    rooms: [],
};

type RoomAction = PayloadAction<{
    room: string;
}>;

const socketSlice = createSlice({
    name: "socket",
    initialState,
    reducers: {
        initSocket: (state) => {
            return;
        },
        disconnectSocket: (state) => {
            return
        },
        connectionEstablished: (state) => {
            state.isConnected = true;
        },
        connectionLost: (state) => {
            state.isConnected = false;
        },

    },
});

export const { initSocket, disconnectSocket, connectionEstablished, connectionLost } =
    socketSlice.actions;
export default socketSlice.reducer;