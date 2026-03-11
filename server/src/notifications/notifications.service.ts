import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from './notification.types';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
        const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
        let privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

        if (privateKey) {
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        if (!admin.apps.length) {
            if (projectId && clientEmail && privateKey) {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
                this.logger.log('Firebase Admin SDK initialized');
            } else {
                this.logger.error('Firebase credentials missing in environment variables');
            }
        }
    }

    async registerToken(adminId: string, deviceToken: string): Promise<void> {
        await this.prisma.admin.update({
            where: { id: adminId },
            data: { deviceToken },
        });
        this.logger.log(`Device token registered for admin ${adminId}`);
    }

    async sendPush(data: {
        title: string;
        body: string;
        data?: Record<string, string>;
    }): Promise<boolean> {
        const adminRecord = await this.prisma.admin.findFirst();
        if (!adminRecord || !adminRecord.deviceToken) {
            this.logger.warn('No device token registered. Push notification skipped.');
            return false;
        }

        const message: admin.messaging.Message = {
            notification: {
                title: data.title,
                body: data.body,
            },
            data: data.data || {},
            token: adminRecord.deviceToken,
        };

        try {
            await admin.messaging().send(message);
            this.logger.log(`Push notification sent: ${data.title}`);
            return true;
        } catch (error) {
            if (
                error.code === 'messaging/registration-token-not-registered' ||
                error.code === 'messaging/invalid-registration-token'
            ) {
                await this.prisma.admin.update({
                    where: { id: adminRecord.id },
                    data: { deviceToken: null },
                });
                this.logger.warn('Stale device token cleared. Admin must re-register token.');
            } else {
                this.logger.error(`Push notification failed: ${error.message}`);
            }
            return false;
        }
    }

    async sendLowStockPush(productName: string, currentQuantity: number): Promise<boolean> {
        return this.sendPush({
            title: '⚠️ Low Stock Alert',
            body: `${productName} has only ${currentQuantity} units remaining`,
            data: {
                type: NotificationType.LOW_STOCK,
                productName,
                quantity: currentQuantity.toString(),
            },
        });
    }

    async sendNewBillPush(
        billNumber: string,
        customerName: string,
        total: number,
    ): Promise<boolean> {
        return this.sendPush({
            title: '✅ New Bill Created',
            body: `Bill ${billNumber} for ${customerName} — ₹${total.toFixed(2)}`,
            data: {
                type: NotificationType.NEW_BILL,
                billNumber,
                total: total.toString(),
            },
        });
    }

    async sendDailySummaryPush(totalRevenue: number, billCount: number): Promise<boolean> {
        return this.sendPush({
            title: '📊 Daily Summary',
            body: `${billCount} bills today — ₹${totalRevenue.toFixed(2)} total revenue`,
            data: {
                type: NotificationType.DAILY_SUMMARY,
                revenue: totalRevenue.toString(),
                bills: billCount.toString(),
            },
        });
    }

    async sendEodSummaryIfNeeded(): Promise<void> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const billsToday = await this.prisma.bill.findMany({
            where: {
                createdAt: {
                    gte: today,
                },
            },
        });

        const billCount = billsToday.length;
        const totalRevenue = billsToday.reduce((sum, bill) => sum + bill.total, 0);

        if (billCount > 0) {
            await this.sendDailySummaryPush(totalRevenue, billCount);
        } else {
            await this.sendPush({
                title: '📋 End of Day',
                body: 'No bills created today.',
                data: { type: NotificationType.DAILY_SUMMARY },
            });
        }
    }
}
