import { EmailService } from '../../src/services/email.service';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailService', () => {
  let emailService: EmailService;
  const mockTransporter = {
    sendMail: jest.fn(),
  };

  beforeEach(() => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    emailService = EmailService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValueOnce({ messageId: 'test-id' });

      const result = await emailService.sendEmail({
        to: 'test@example.com',
        template: 'welcome',
        subject: 'Welcome to our platform',
        data: {
          username: 'testuser',
          verificationLink: 'http://example.com/verify',
        },
      });

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: process.env.EMAIL_FROM,
          to: 'test@example.com',
          subject: 'Welcome to our platform',
          html: expect.stringContaining('Welcome'),
        })
      );
    });

    it('should handle missing template', async () => {
      const result = await emailService.sendEmail({
        to: 'test@example.com',
        template: 'non-existent' as any,
        subject: 'Test',
        data: {},
      });

      expect(result).toBe(false);
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

    it('should handle send failure', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('Send failed'));

      const result = await emailService.sendEmail({
        to: 'test@example.com',
        template: 'welcome',
        subject: 'Test',
        data: {
          username: 'testuser',
          verificationLink: 'http://example.com/verify',
        },
      });

      expect(result).toBe(false);
    });
  });
}); 