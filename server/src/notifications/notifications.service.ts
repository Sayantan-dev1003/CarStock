import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';
import { NotificationType } from './notification.types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      this.logger.log('Firebase Admin SDK initialized');
    } else {
      this.logger.log('Firebase Admin SDK already initialized');
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

    const message = {
      notification: {
        title: data.title,
        body: data.body,
      },
      data: data.data ?? {},
      token: adminRecord.deviceToken,
    };

    try {
      await admin.messaging().send(message);
      this.logger.log('Push notification sent: ' + data.title);
      return true;
    } catch (error) {
      const staleTokenCodes = [
        'messaging/registration-token-not-registered',
        'messaging/invalid-registration-token',
      ];
      if (staleTokenCodes.includes(error.code)) {
        await this.prisma.admin.updateMany({
          data: { deviceToken: null },
        });
        this.logger.warn(
          'Stale device token cleared. Admin must re-register token.',
        );
      } else {
        this.logger.error('Push notification failed: ' + error.message);
      }
      return false;
    }
  }

  async sendLowStockPush(
    productName: string,
    currentQuantity: number,
  ): Promise<boolean> {
    return this.sendPush({
      title: '⚠️ Low Stock Alert',
      body: productName + ' has only ' + currentQuantity + ' units remaining',
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
      body:
        'Bill ' +
        billNumber +
        ' for ' +
        customerName +
        ' — ₹' +
        total.toFixed(2),
      data: {
        type: NotificationType.NEW_BILL,
        billNumber,
        total: total.toString(),
      },
    });
  }

  async sendDailySummaryPush(
    totalRevenue: number,
    billCount: number,
  ): Promise<boolean> {
    return this.sendPush({
      title: '📊 Daily Summary',
      body:
        billCount +
        ' bills today — ₹' +
        totalRevenue.toFixed(2) +
        ' total revenue',
      data: {
        type: NotificationType.DAILY_SUMMARY,
        revenue: totalRevenue.toString(),
        bills: billCount.toString(),
      },
    });
  }

  async sendEodSummaryIfNeeded(): Promise<void> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const bills = await this.prisma.bill.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const billCount = bills.length;
    const totalRevenue = bills.reduce(
      (sum, bill) => sum + Number(bill.total),
      0,
    );

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
