import { io, Socket } from 'socket.io-client';

const socket: Socket = io(process.env.REACT_APP_ERPNEXT_URL || '', {
  withCredentials: true,
  extraHeaders: {
    'Authorization': `token ${process.env.REACT_APP_API_KEY}:${process.env.REACT_APP_API_SECRET}`
  }
});

export const subscribeToDocUpdates = (doctype: string, docname: string, callback: (data: any) => void) => {
  const eventName = `doc_update:${doctype}/${docname}`;
  socket.on(eventName, callback);
  
  return () => {
    socket.off(eventName, callback);
  };
};

export const subscribeToDocType = (doctype: string, callback: (data: any) => void) => {
  const eventName = `list_update:${doctype}`;
  socket.on(eventName, callback);
  
  return () => {
    socket.off(eventName, callback);
  };
};

export default socket;
