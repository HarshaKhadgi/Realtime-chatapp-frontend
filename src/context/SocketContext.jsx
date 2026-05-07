import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const userInfo = useSelector((state) => state.auth.userInfo);

    // ----------------------------------------------------------------------
    // GLOBAL WEBSOCKET CONNECTION LIFECYCLE
    // ----------------------------------------------------------------------
    // This `useEffect` continuously monitors the Redux `userInfo` login state.
    // When a user successfully logs in, it intrinsically mounts the socket runtime and 
    // routes it directly to our Express instance. This design prevents unauthorized empty sockets 
    // from draining resources on the backend!
    useEffect(() => {
        if (userInfo) {
            // 1. Establish the bidirectional pipeline. `withCredentials: true` is strictly required 
            // since our Node server enforces HTTP-only securely signed cookies for Auth!
            const socketInstance = io('http://localhost:5000', {
                withCredentials: true,
            });

            setSocket(socketInstance);

            // 2. Perform Handshake: Immediately beam our User's payload to the server 
            // so `server.js` can formally map our Socket ID mathematically to our MongoDB `_id`.
            socketInstance.emit('setup', userInfo);

            // 3. Wait for the server to formally confirm we are locked securely into our private Room.
            socketInstance.on('connected', () => console.log('Socket Connected Securely'));

            // 4. Teardown: If the component unmounts, forcefully kill the socket to prevent memory leak arrays.
            return () => socketInstance.close();
        } else {
            // 5. Logout Handling: If `userInfo` structurally drops to null (Logout event), explicitly 
            // tear down the current active physical socket connection to isolate network flows!
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [userInfo]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
