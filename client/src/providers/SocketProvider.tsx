// import React, {createContext, useContext} from 'react';
// // import {socket} from "@/socket/socket";
// import {io, Socket} from "socket.io-client";
//
// const SocketContext = createContext<Socket>()
// export const useSocket = () => useContext(SocketContext)
// const SocketProvider = ({ children }) => {
//     const socket = io(process.env.SOCKET_URL)
//     return (
//         <SocketContext.Provider value={socket}>
//             {children}
//         </SocketContext.Provider>
//     )
// }
//
// export default SocketProvider;