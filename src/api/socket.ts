import { io, Socket } from 'socket.io-client';

// Only connect to socket if we have a valid ERPNext URL
const shouldConnect = process.env.REACT_APP_ERPNEXT_URL && 
  process.env.REACT_APP_ERPNEXT_URL !== 'your-erpnext-instance' &&
  process.env.REACT_APP_ERPNEXT_URL !== '' &&
  process.env.REACT_APP_ERPNEXT_URL !== 'http://your-erpnext-instance';

// Create a mock socket that doesn't connect when we don't have a valid URL
const socket: Socket = shouldConnect ? io(process.env.REACT_APP_ERPNEXT_URL!, {
  withCredentials: true,
  extraHeaders: {
    'Authorization': `token ${process.env.REACT_APP_API_KEY}:${process.env.REACT_APP_API_SECRET}`
  }
}) : {
  on: () => {},
  off: () => {},
  emit: () => {},
  connect: () => {},
  disconnect: () => {},
  connected: false,
  id: null
} as any;

export const subscribeToDocUpdates = (doctype: string, docname: string, callback: (data: any) => void) => {
  if (!shouldConnect) return () => {}; // No-op if socket not connected
  
  const eventName = `doc_update:${doctype}/${docname}`;
  socket.on(eventName, callback);
  
  return () => {
    socket.off(eventName, callback);
  };
};

export const subscribeToDocType = (doctype: string, callback: (data: any) => void) => {
  if (!shouldConnect) return () => {}; // No-op if socket not connected
  
  const eventName = `list_update:${doctype}`;
  socket.on(eventName, callback);
  
  return () => {
    socket.off(eventName, callback);
  };
};

export default socket;
