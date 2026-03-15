import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { billingApi } from '../api/billing.api';
import { CreateBillPayload, BillResult, BillProcessingStatus } from '../types/billing.types';

const WS_URL = process.env.EXPO_PUBLIC_API_URL || '';

export function useBillCreation() {
  const [status, setStatus] = useState<BillProcessingStatus>('IDLE');
  const [result, setResult] = useState<BillResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only initialize socket once
    const socket = io(`${WS_URL}/bills`, {
      transports: ['websocket'],
      autoConnect: false,
    });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const createBill = async (billData: CreateBillPayload) => {
    setStatus('PROCESSING');
    setResult(null);
    setError(null);

    try {
      // Phase 1: Get billId immediately
      const response: any = await billingApi.createBill(billData);
      const { billId } = response;

      if (!billId) {
        throw new Error('Failed to get bill ID from server');
      }

      // Phase 3 setup: Join WebSocket room for this bill
      const socket = socketRef.current!;
      if (!socket.connected) {
        socket.connect();
      }
      
      socket.emit('join-bill-room', { billId });

      socket.on('bill:updated', (updatedData: BillResult) => {
        setResult(updatedData);
        setStatus('COMPLETED');
        socket.emit('leave-bill-room', { billId });
        socket.off('bill:updated');
        socket.off('bill:failed');
      });

      socket.on('bill:failed', (failedData: { billId: string; error: string }) => {
        setError(failedData.error || 'Bill processing failed');
        setStatus('FAILED');
        socket.emit('leave-bill-room', { billId });
        socket.off('bill:updated');
        socket.off('bill:failed');
      });

      // Fallback: If WebSocket doesn't respond in 60s, poll once
      const fallbackTimer = setTimeout(async () => {
        try {
          const billData = await billingApi.getBill(billId);
          if (billData.status === 'COMPLETED') {
            setResult({
              billId: billData.id,
              billNumber: billData.billNumber,
              total: billData.total,
              customerName: (billData as any).customer?.name || 'Customer',
              paymentMode: billData.paymentMode,
              pdfUrl: billData.pdfUrl || null,
              emailSent: billData.emailSent,
              whatsappSent: billData.whatsappSent,
              status: billData.status,
            });
            setStatus('COMPLETED');
          } else if (billData.status === 'FAILED') {
            setStatus('FAILED');
            setError('Bill processing failed (safety timeout)');
          }
        } catch (err) {
          console.error('Fallback polling failed', err);
        }
        socket.off('bill:updated');
        socket.off('bill:failed');
      }, 60000);

      socket.on('bill:updated', () => clearTimeout(fallbackTimer));
      socket.on('bill:failed', () => clearTimeout(fallbackTimer));

    } catch (err: any) {
      console.error('Bill creation failed', err);
      setError(err.message || 'Failed to create bill');
      setStatus('FAILED');
    }
  };

  const reset = () => {
    setStatus('IDLE');
    setResult(null);
    setError(null);
  };

  return { createBill, status, result, error, reset };
}
