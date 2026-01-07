// src/socket.js
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
    transports: ['websocket'], // more stable in many cases
});

export default socket;
