import { createSlice } from "@reduxjs/toolkit";

export interface SocketState {
    isConnected: boolean,
}

const initialState: SocketState = {
    isConnected: false,
}

const socketSlice = createSlice({
    name: "socket",
    initialState,
    reducers: {
        initSocket: (state) => {
            return
        },
        disconnectSocket: (state) => {
            return
        },
        connectionEstablished: (state) => {
            state.isConnected = true
        },
        connectionLost: (state) => {
            state.isConnected = false
        },
    },
})

export default socketSlice.reducer
export const { initSocket, disconnectSocket, connectionEstablished, connectionLost } = socketSlice.actions
