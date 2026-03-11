import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useInventoryStore } from '../store/inventory.store';

interface StockUpdatePayload {
    productId: string;
    productName: string;
    newQuantity: number;
    type: 'ADD' | 'DEDUCT';
    timestamp: string;
}

interface LowStockAlertPayload {
    productId: string;
    productName: string;
    currentQuantity: number;
    reorderLevel: number;
    timestamp: string;
}

export function useSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const inventoryStore = useInventoryStore();

    useEffect(() => {
        // Create socket connection
        const socket = io(process.env.EXPO_PUBLIC_SOCKET_URL as string, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected to server');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socket.on('stock_updated', (payload: StockUpdatePayload) => {
            console.log('Stock updated:', payload);
            inventoryStore.updateProductQuantity(payload.productId, payload.newQuantity);
        });

        socket.on('low_stock_alert', (payload: LowStockAlertPayload) => {
            console.log('Low stock alert:', payload);
            // In a real app, we'd show a toast here
            // For now, we update the store which can trigger UI changes
            inventoryStore.setLowStockCount(inventoryStore.lowStockCount + 1);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return { isConnected };
}
