import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Mailjet from 'node-mailjet';

@Injectable()
export class EmailService {
  private mailjet: Mailjet.Client;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly mailjetVersion: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('MAILJET_API_KEY');
    const secretKey = this.configService.get<string>('MAILJET_API_SECRET');
    
    if (!apiKey || !secretKey) {
      this.logger.warn('Mailjet API key or secret key not provided');
    } else {
      this.mailjet = Mailjet.apiConnect(apiKey, secretKey);
    }
    
    this.fromEmail = this.configService.get<string>('FROM_EMAIL');
    this.fromName = this.configService.get<string>('FROM_NAME');
    this.mailjetVersion = this.configService.get<string>('MAILJET_VERSION');
  }

  /**
   * Sends a verification OTP to the user for registration
   */
  async sendVerificationOTP(
    to: string, 
    name: string, 
    otp: string
  ): Promise<boolean> {
    const subject = 'Verify your FoodShare account';
    const htmlContent = `
      <h1>Welcome to FoodShare!</h1>
      <p>Hello ${name},</p>
      <p>Thank you for registering with FoodShare. Please verify your email address by entering the following verification code:</p>
      <div style="background-color: #f4f4f4; padding: 10px; margin: 20px 0; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
        ${otp}
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p>If you did not sign up for FoodShare, please ignore this email.</p>
      <p>Thank you,<br>The FoodShare Team</p>
    `;
    
    return this.sendEmail(to, name, subject, htmlContent);
  }

  /**
   * Sends a login OTP to the user
   */
  async sendLoginOTP(
    to: string, 
    name: string, 
    otp: string
  ): Promise<boolean> {
    const subject = 'Login to FoodShare';
    const htmlContent = `
      <h1>Login to FoodShare</h1>
      <p>Hello ${name},</p>
      <p>Here is your verification code to log in to FoodShare:</p>
      <div style="background-color: #f4f4f4; padding: 10px; margin: 20px 0; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
        ${otp}
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p>If you did not request this code, please ignore this email.</p>
      <p>Thank you,<br>The FoodShare Team</p>
    `;
    
    return this.sendEmail(to, name, subject, htmlContent);
  }

  /**
   * Sends a notification about a donation being claimed
   */
  async sendDonationClaimedEmail(
    to: string,
    name: string,
    donationTitle: string,
    claimerName: string,
    postId: string
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const postLink = `${frontendUrl}/post/${postId}`;
    
    const subject = 'Your FoodShare donation has been claimed';
    const htmlContent = `
      <h1>Your donation has been claimed!</h1>
      <p>Hello ${name},</p>
      <p>Good news! Your donation "${donationTitle}" has been claimed by ${claimerName}.</p>
      <p>You can view the details and get in touch with the claimer by clicking the link below:</p>
      <p><a href="${postLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">View Donation</a></p>
      <p>Thank you for sharing and reducing food waste!</p>
      <p>The FoodShare Team</p>
    `;
    
    return this.sendEmail(to, name, subject, htmlContent);
  }

  /**
   * Sends a notification about a request being fulfilled
   */
  async sendRequestFulfilledEmail(
    to: string,
    name: string,
    requestTitle: string,
    fulfillerName: string,
    postId: string
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const postLink = `${frontendUrl}/post/${postId}`;
    
    const subject = 'Your FoodShare request has been fulfilled';
    const htmlContent = `
      <h1>Your request has been fulfilled!</h1>
      <p>Hello ${name},</p>
      <p>Great news! Your request "${requestTitle}" has been fulfilled by ${fulfillerName}.</p>
      <p>You can view the details and get in touch with the fulfiller by clicking the link below:</p>
      <p><a href="${postLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">View Request</a></p>
      <p>Thank you for being part of our community!</p>
      <p>The FoodShare Team</p>
    `;
    
    return this.sendEmail(to, name, subject, htmlContent);
  }

  /**
   * Sends a notification about a post status update (picked up or completed)
   */
  async sendPostStatusUpdateEmail(
    to: string,
    name: string,
    postTitle: string,
    status: string,
    updaterName: string,
    postId?: string
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const postLink = postId ? `${frontendUrl}/post/${postId}` : `${frontendUrl}/my-claims`;
    
    const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
    const subject = `FoodShare: Your post has been marked as ${status}`;
    
    const htmlContent = `
      <h1>Post Status Update</h1>
      <p>Hello ${name},</p>
      <p>Your post "${postTitle}" has been marked as <strong>${statusCapitalized}</strong> by ${updaterName}.</p>
      ${status === 'completed' ? 
        `<p>Please take a moment to rate your experience with ${updaterName}!</p>` : 
        ''}
      <p>You can view the details by clicking the link below:</p>
      <p><a href="${postLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">View Details</a></p>
      <p>Thank you for being part of our community!</p>
      <p>The FoodShare Team</p>
    `;
    
    return this.sendEmail(to, name, subject, htmlContent);
  }

  /**
   * Generic method to send an email
   */
  async sendEmail(
    to: string,
    name: string,
    subject: string,
    htmlContent: string
  ): Promise<boolean> {
    if (!this.mailjet) {
      this.logger.warn('Mailjet client not initialized, email not sent');
      return false;
    }
    
    try {
      const response = await this.mailjet
        .post('send', { version: this.mailjetVersion })
        .request({
          Messages: [
            {
              From: {
                Email: this.fromEmail,
                Name: this.fromName,
              },
              To: [
                {
                  Email: to,
                  Name: name,
                },
              ],
              Subject: subject,
              HTMLPart: htmlContent,
            },
          ],
        });
      
      this.logger.log(`Email sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      return false;
    }
  }
} 