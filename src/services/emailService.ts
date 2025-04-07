import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private static instance: EmailService | null = null;

  private constructor() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('EMAIL_USER and EMAIL_PASS must be defined');
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * 이메일을 전송합니다.
   */
  public async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * 텔레그램 봇 링크를 이메일로 전송합니다.
   */
  public async sendTelegramBotLink(email: string, name: string): Promise<void> {
    const botUsername = 'KOR_Chall_bot';
    const botLink = `https://t.me/${botUsername}`;
    
    const subject = '한국어 학습 챌린지에 오신 것을 환영합니다!';
    const text = `안녕하세요, ${name}님!\n\n한국어 학습 챌린지에 오신 것을 환영합니다.\n\n무료 체험이 시작되었습니다. 체험 기간은 2025. 4. 8.까지입니다.\n\n아래 버튼을 클릭하거나 QR 코드를 스캔하여 Telegram 봇을 시작해주세요:\n${botLink}\n\n감사합니다!`;
    
    // QR 코드 생성
    const qrCodeDataUrl = await QRCode.toDataURL(botLink);
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d;">안녕하세요, ${name}님!</h1>
        <p style="font-size: 16px; color: #4a5568;">한국어 학습 챌린지에 오신 것을 환영합니다.</p>
        <p style="font-size: 16px; color: #4a5568;">무료 체험이 시작되었습니다. 체험 기간은 2025. 4. 8.까지입니다.</p>
        <p style="font-size: 16px; color: #4a5568;">아래 버튼을 클릭하거나 QR 코드를 스캔하여 Telegram 봇을 시작해주세요:</p>
        
        <div style="margin: 30px 0;">
          <a href="${botLink}" 
             style="display: inline-block; background-color: #3182ce; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Telegram 봇 시작하기
          </a>
        </div>
        
        <div style="margin: 30px 0;">
          <img src="${qrCodeDataUrl}" alt="Telegram Bot QR Code" style="width: 200px; height: 200px;"/>
        </div>
        
        <p style="font-size: 16px; color: #4a5568;">감사합니다!</p>
      </div>
    `;

    await this.sendEmail(email, subject, text, html);
  }
} 