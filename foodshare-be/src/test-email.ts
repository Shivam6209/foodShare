import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EmailService } from './email/email.service';
import { ConfigService } from '@nestjs/config';

async function testEmail() {
  const app = await NestFactory.create(AppModule);
  const emailService = app.get(EmailService);
  const configService = app.get(ConfigService);
  
  console.log('Testing email service...');
  
  // Get test recipient from environment or use a default
  const testEmail = configService.get<string>('TEST_EMAIL') || 'test@example.com';
  
  try {
    const result = await emailService.sendEmail(
      testEmail,
      'Test User',
      'Test Email from FoodShare',
      '<h1>This is a test email</h1><p>If you received this, the Mailjet configuration is working correctly.</p>'
    );
    
    if (result) {
      console.log(`Email sent successfully to ${testEmail}!`);
    } else {
      console.error('Failed to send email.');
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
  
  await app.close();
}

testEmail(); 