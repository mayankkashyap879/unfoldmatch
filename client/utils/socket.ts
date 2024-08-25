import io from 'socket.io-client';

export const createSocket = () => {
  return io(process.env.NEXT_PUBLIC_API_URL as string);
};