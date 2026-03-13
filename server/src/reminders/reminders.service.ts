import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { NotificationsService } from '../notifications/notifications.service';
import { getReminderDays, REMINDER_INTERVALS } from './reminder.config';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

export interface DueReminder {
    purchaseLogId: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerMobile: string;
    vehicleId: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    category: string;
    purchasedAt: Date;
    reminderDays: number;
}

@Injectable()
export class RemindersService {
    private readonly logger = new Logger(RemindersService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
        private readonly whatsappService: WhatsAppService,
        private readonly notificationsService: NotificationsService,
    ) { }

    async getDueReminders(): Promise<DueReminder[]> {
        // Step A: Get all VehiclePurchaseLogs where category has an interval
        const categories = Object.keys(REMINDER_INTERVALS).filter(c => c !== 'OTHER');

        const logs = await this.prisma.vehiclePurchaseLog.findMany({
            where: {
                category: { in: categories },
            },
            include: {
                vehicle: {
                    include: {
                        customer: true,
                    },
                },
            },
        });

        const today = dayjs();
        const dueReminders: DueReminder[] = [];

        // Step B: Filter in JS
        for (const log of logs) {
            const reminderDays = getReminderDays(log.category);
            const dueDate = dayjs(log.purchasedAt).add(reminderDays, 'day');

            const isDue = dueDate.isSameOrBefore(today) && dueDate.isAfter(today.subtract(7, 'day'));

            if (isDue) {
                // Step C: For each due log check if a reminder was already sent
                const alreadySent = await this.prisma.reminderLog.findFirst({
                    where: {
                        purchaseLogId: log.id,
                        sentAt: {
                            gte: dayjs().subtract(reminderDays, 'day').toDate(),
                        },
                    },
                });

                if (!alreadySent) {
                    dueReminders.push({
                        purchaseLogId: log.id,
                        customerId: log.vehicle.customerId,
                        customerName: log.vehicle.customer.name,
                        customerEmail: log.vehicle.customer.email,
                        customerMobile: log.vehicle.customer.mobile,
                        vehicleId: log.vehicleId,
                        vehicleMake: log.vehicle.make,
                        vehicleModel: log.vehicle.model,
                        vehicleYear: log.vehicle.year,
                        category: log.category,
                        purchasedAt: log.purchasedAt,
                        reminderDays,
                    });
                }
            }
        }

        return dueReminders;
    }

    async sendReminderToCustomer(reminder: DueReminder): Promise<{ emailSent: boolean; whatsappSent: boolean }> {
        const admin = await this.prisma.admin.findFirst();
        if (!admin) {
            this.logger.error('Admin record not found, cannot send reminders');
            return { emailSent: false, whatsappSent: false };
        }

        const formattedDate = dayjs(reminder.purchasedAt).format('DD MMM YYYY');

        let emailSent = false;
        try {
            await this.emailService.sendServiceReminder({
                toEmail: reminder.customerEmail,
                customerName: reminder.customerName,
                vehicleMake: reminder.vehicleMake,
                vehicleModel: reminder.vehicleModel,
                vehicleYear: reminder.vehicleYear,
                productCategory: reminder.category,
                lastPurchaseDate: formattedDate,
                shopName: admin.shopName,
                shopPhone: admin.shopPhone ?? '',
            });
            emailSent = true;
        } catch (error) {
            this.logger.error(`Reminder email failed for customer ${reminder.customerName}: ${error.message}`);
        }

        let whatsappSent = false;
        try {
            whatsappSent = await this.whatsappService.sendServiceReminder({
                mobile: reminder.customerMobile,
                customerName: reminder.customerName,
                vehicleMake: reminder.vehicleMake,
                vehicleModel: reminder.vehicleModel,
                vehicleYear: reminder.vehicleYear,
                productCategory: reminder.category,
                lastPurchaseDate: formattedDate,
                shopName: admin.shopName,
                shopPhone: admin.shopPhone ?? '',
            });
        } catch (error) {
            this.logger.error(`Reminder WhatsApp failed for customer ${reminder.customerName}: ${error.message}`);
        }

        return { emailSent, whatsappSent };
    }

    async logReminderSent(
        reminder: DueReminder,
        emailSent: boolean,
        whatsappSent: boolean,
    ): Promise<void> {
        await this.prisma.reminderLog.create({
            data: {
                customerId: reminder.customerId,
                vehicleId: reminder.vehicleId,
                purchaseLogId: reminder.purchaseLogId,
                category: reminder.category,
                emailSent,
                whatsappSent,
            },
        });

        this.logger.log(`Reminder logged for customer ${reminder.customerName}`);
    }

    async processAllDueReminders(): Promise<{
        processed: number;
        emailsSent: number;
        whatsappsSent: number;
        errors: number;
    }> {
        const dueReminders = await this.getDueReminders();
        this.logger.log(`Found ${dueReminders.length} due reminders to process`);

        if (dueReminders.length === 0) {
            return { processed: 0, emailsSent: 0, whatsappsSent: 0, errors: 0 };
        }

        let emailsSent = 0;
        let whatsappsSent = 0;
        let errors = 0;

        for (const reminder of dueReminders) {
            try {
                const result = await this.sendReminderToCustomer(reminder);
                await this.logReminderSent(reminder, result.emailSent, result.whatsappSent);

                if (result.emailSent) emailsSent++;
                if (result.whatsappSent) whatsappsSent++;

                this.logger.log(`Reminder sent to ${reminder.customerName} for ${reminder.vehicleMake} ${reminder.vehicleModel} (${reminder.category})`);

                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                errors++;
                this.logger.error(`Failed to process reminder for customer ${reminder.customerId}: ${error.message}`);
            }
        }

        const summary = {
            processed: dueReminders.length,
            emailsSent,
            whatsappsSent,
            errors,
        };

        this.logger.log(`Reminder batch complete: ${JSON.stringify(summary)}`);

        if (summary.processed > 0) {
            try {
                await this.notificationsService.sendPush({
                    title: '📨 Service Reminders Sent',
                    body: `${summary.emailsSent} emails and ${summary.whatsappsSent} WhatsApp messages sent to customers`,
                    data: { type: 'SERVICE_REMINDER' },
                });
            } catch (error) {
                this.logger.error(`Summary push failed: ${error.message}`);
            }
        }

        return summary;
    }

    async getRemindersHistory(page: number, limit: number): Promise<{ data: any[]; total: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.reminderLog.findMany({
                skip,
                take: limit,
                orderBy: { sentAt: 'desc' },
            }),
            this.prisma.reminderLog.count(),
        ]);

        // Resolve customer names
        const dataWithNames = await Promise.all(
            data.map(async (log) => {
                const customer = await this.prisma.customer.findUnique({
                    where: { id: log.customerId },
                    select: { name: true },
                });
                return { ...log, customerName: customer?.name || 'Unknown' };
            }),
        );

        return { data: dataWithNames, total };
    }

    async triggerManualReminder(customerId: string): Promise<{
        sent: boolean;
        emailSent: boolean;
        whatsappSent: boolean;
    }> {
        const categories = Object.keys(REMINDER_INTERVALS).filter(c => c !== 'OTHER');

        const latestLog = await this.prisma.vehiclePurchaseLog.findFirst({
            where: {
                vehicle: { customerId },
                category: { in: categories },
            },
            include: {
                vehicle: {
                    include: {
                        customer: true,
                    },
                },
            },
            orderBy: { purchasedAt: 'desc' },
        });

        if (!latestLog) {
            throw new NotFoundException('No eligible purchase found for reminder');
        }

        const reminder: DueReminder = {
            purchaseLogId: latestLog.id,
            customerId: latestLog.vehicle.customerId,
            customerName: latestLog.vehicle.customer.name,
            customerEmail: latestLog.vehicle.customer.email,
            customerMobile: latestLog.vehicle.customer.mobile,
            vehicleId: latestLog.vehicleId,
            vehicleMake: latestLog.vehicle.make,
            vehicleModel: latestLog.vehicle.model,
            vehicleYear: latestLog.vehicle.year,
            category: latestLog.category,
            purchasedAt: latestLog.purchasedAt,
            reminderDays: getReminderDays(latestLog.category),
        };

        const result = await this.sendReminderToCustomer(reminder);

        // DELIBERATE SKIP: Manual triggers do not check for duplicates in ReminderLog
        // but we still log the attempt for history.
        await this.logReminderSent(reminder, result.emailSent, result.whatsappSent);

        return {
            sent: true,
            emailSent: result.emailSent,
            whatsappSent: result.whatsappSent,
        };
    }
}
