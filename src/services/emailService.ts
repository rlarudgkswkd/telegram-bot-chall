import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Telegram 봇 링크를 이메일로 보냅니다.
   * @param email 사용자 이메일
   * @param name 사용자 이름
   * @param isTrial 무료 체험 여부
   * @param trialEndDate 무료 체험 종료일 (무료 체험인 경우)
   */
  public async sendTelegramBotLink(
    email: string,
    name: string,
    isTrial: boolean = false,
    trialEndDate?: Date
  ): Promise<void> {
    try {
      // QR 코드 생성
      const botLink = `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`;
      const qrCodeDataUrl = await QRCode.toDataURL(botLink);

      // 이메일 템플릿
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>안녕하세요, ${name}님!</h2>
          <p>한국어 학습 챌린지에 오신 것을 환영합니다.</p>
          ${
            isTrial
              ? `<p>무료 체험이 시작되었습니다. ${
                  trialEndDate
                    ? `체험 기간은 ${trialEndDate.toLocaleDateString(
                        'ko-KR'
                      )}까지입니다.`
                    : ''
                }</p>`
              : '<p>구독이 시작되었습니다.</p>'
          }
          <p>아래 버튼을 클릭하거나 QR 코드를 스캔하여 Telegram 봇을 시작해주세요:</p>
          <p>
            <a href="${botLink}" 
               style="background-color: #0088cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
              Telegram 봇 시작하기
            </a>
          </p>
          <img src="${qrCodeDataUrl}" alt="Telegram Bot QR Code" style="width: 200px; height: 200px;"/>
          <p>문의사항이 있으시면 언제든 회신해주세요.</p>
          <p>감사합니다!</p>
        </div>
      `;

      // 이메일 전송
      await this.transporter.verify();
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: '한국어 학습 챌린지 - Telegram 봇 링크',
        html,
      });

      console.log('Telegram bot link email sent successfully');
    } catch (error) {
      console.error('Error sending Telegram bot link email:', error);
      throw error;
    }
  }
}

export default EmailService; 