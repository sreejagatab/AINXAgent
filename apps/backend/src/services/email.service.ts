import nodemailer from 'nodemailer';
import { redis } from '../lib/redis';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { logger } from '../utils/logger';
import { renderTemplate } from '../utils/template';
import type { 
  EmailOptions, 
  EmailTemplate,
  EmailMetrics 
} from '../types/email.types';

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;
  private readonly CACHE_PREFIX = 'email:';
  private readonly CACHE_TTL = 3600; // 1 hour

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
    });

    this.verifyConnection();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const { to, template, subject, data } = options;

      // Check rate limit
      await this.checkRateLimit(to);

      // Render email template
      const html = await this.renderEmailTemplate(template, data);

      // Send email
      await this.transporter.sendMail({
        from: config.EMAIL_FROM,
        to,
        subject,
        html,
      });

      // Track email metrics
      await this.trackEmailSent(to, template, true);
    } catch (error) {
      logger.error('Failed to send email:', error);
      await this.trackEmailSent(options.to, options.template, false, error.message);
      throw error;
    }
  }

  public async sendBulkEmails(
    options: EmailOptions[],
    batchSize = 10
  ): Promise<void> {
    try {
      // Process in batches to avoid overwhelming the SMTP server
      for (let i = 0; i < options.length; i += batchSize) {
        const batch = options.slice(i, i + batchSize);
        await Promise.all(
          batch.map(opt => this.sendEmail(opt))
        );
        // Wait between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      logger.error('Failed to send bulk emails:', error);
      throw error;
    }
  }

  public async getEmailMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<EmailMetrics> {
    try {
      const metrics = await prisma.emailMetrics.groupBy({
        by: ['template', 'status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
      });

      return this.processEmailMetrics(metrics);
    } catch (error) {
      logger.error('Failed to get email metrics:', error);
      throw error;
    }
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('SMTP connection established');
    } catch (error) {
      logger.error('SMTP connection failed:', error);
      throw error;
    }
  }

  private async checkRateLimit(email: string): Promise<void> {
    const key = `${this.CACHE_PREFIX}ratelimit:${email}`;
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, 3600); // 1 hour window
    }

    if (count > 10) { // Max 10 emails per hour per recipient
      throw new Error('Email rate limit exceeded');
    }
  }

  private async renderEmailTemplate(
    template: EmailTemplate,
    data: Record<string, any>
  ): Promise<string> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}template:${template}`;
      let templateHtml = await redis.get(cacheKey);

      if (!templateHtml) {
        templateHtml = await renderTemplate(template, data);
        await redis.set(cacheKey, templateHtml, 'EX', this.CACHE_TTL);
      }

      return templateHtml;
    } catch (error) {
      logger.error('Failed to render email template:', error);
      throw error;
    }
  }

  private async trackEmailSent(
    to: string,
    template: EmailTemplate,
    success: boolean,
    error?: string
  ): Promise<void> {
    try {
      await prisma.emailMetrics.create({
        data: {
          recipient: to,
          template,
          status: success ? 'sent' : 'failed',
          error,
        },
      });
    } catch (err) {
      logger.error('Failed to track email metrics:', err);
    }
  }

  private processEmailMetrics(rawMetrics: any[]): EmailMetrics {
    return {
      totalSent: rawMetrics.reduce((acc, m) => 
        acc + (m.status === 'sent' ? m._count : 0), 0),
      totalFailed: rawMetrics.reduce((acc, m) => 
        acc + (m.status === 'failed' ? m._count : 0), 0),
      byTemplate: rawMetrics.reduce((acc, m) => {
        if (!acc[m.template]) {
          acc[m.template] = { sent: 0, failed: 0 };
        }
        acc[m.template][m.status] += m._count;
        return acc;
      }, {}),
    };
  }
}

export const emailService = EmailService.getInstance(); 