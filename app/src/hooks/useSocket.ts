import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useInventoryStore } from '../store/inventory.store';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const updateProductQuantity = useInventoryStore((state) => state.updateProductQuantity);
  const setLowStockCount = useInventoryStore((state) => state.setLowStockCount);

  useEffect(() => {
    const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL!;
    console.log('Connecting to socket:', socketUrl);

    const socketInstance = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socketInstance.on('stock_updated', (data: { productId: string; quantity: number }) => {
      updateProductQuantity(data.productId, data.quantity);
    });

    socketInstance.on('low_stock_alert', (data: { count: number }) => {
      setLowStockCount(data.count);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected };
}
