import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class InventoryGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private server: Server;

    private readonly logger = new Logger(InventoryGateway.name);

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    afterInit(_server: Server): void {
        this.logger.log('Inventory WebSocket Gateway initialized');
    }

    handleConnection(client: Socket): void {
        this.logger.log(`Client connected: ${client.id}`);
        try {
            client.emit('connected', {
                message: 'Connected to CarStock real-time server',
                timestamp: new Date().toISOString(),
            });
        } catch (err) {
            this.logger.error(`Failed to emit connected event to ${client.id}`, err);
        }
    }

    handleDisconnect(client: Socket): void {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // ── Test handler ───────────────────────────────────────────────────────────

    @SubscribeMessage('ping')
    handlePing(client: Socket): void {
        try {
            client.emit('pong', {
                message: 'pong',
                timestamp: new Date().toISOString(),
            });
        } catch (err) {
            this.logger.error(`Failed to emit pong to ${client.id}`, err);
        }
    }

    // ── Broadcast emitters — fire-and-forget, never throw ─────────────────────

    emitStockUpdate(
        productId: string,
        productName: string,
        newQuantity: number,
        type: 'ADD' | 'DEDUCT',
    ): void {
        try {
            this.server.emit('stock_updated', {
                productId,
                productName,
                newQuantity,
                type,
                timestamp: new Date().toISOString(),
            });
            this.logger.log(
                `Emitted stock_updated for product ${productName}: ${newQuantity} remaining`,
            );
        } catch (err) {
            this.logger.error('Failed to emit stock_updated', err);
        }
    }

    emitLowStockAlert(
        productId: string,
        productName: string,
        currentQuantity: number,
        reorderLevel: number,
    ): void {
        try {
            this.server.emit('low_stock_alert', {
                productId,
                productName,
                currentQuantity,
                reorderLevel,
                timestamp: new Date().toISOString(),
            });
            this.logger.warn(
                `LOW STOCK ALERT emitted for ${productName}: ${currentQuantity} remaining`,
            );
        } catch (err) {
            this.logger.error('Failed to emit low_stock_alert', err);
        }
    }

    emitBillCreated(
        billId: string,
        billNumber: string,
        customerName: string,
        total: number,
    ): void {
        try {
            this.server.emit('bill_created', {
                billId,
                billNumber,
                customerName,
                total,
                timestamp: new Date().toISOString(),
            });
            this.logger.log(
                `Emitted bill_created: ${billNumber} for ${customerName} — ₹${total}`,
            );
        } catch (err) {
            this.logger.error('Failed to emit bill_created', err);
        }
    }
}
