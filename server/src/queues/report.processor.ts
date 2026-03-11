import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { REPORT_GENERATION_QUEUE, JOB_GENERATE_REPORT } from './queue.constants';
import { ReportsService } from '../reports/reports.service';
import { ReportPdfService } from '../reports/report-pdf.service';

@Processor(REPORT_GENERATION_QUEUE)
export class ReportProcessor {
    private readonly logger = new Logger(ReportProcessor.name);

    constructor(
        private readonly reportsService: ReportsService,
        private readonly reportPdfService: ReportPdfService,
    ) { }

    @Process(JOB_GENERATE_REPORT)
    async handleGenerateReport(
        job: Job<{
            type: 'daily' | 'weekly' | 'monthly';
            date?: string;
        }>,
    ) {
        this.logger.log(`Processing report job: ${job.data.type}`);
        // This processor is a placeholder for now
        // Future: Handle large dataset report generation here
    }
}
