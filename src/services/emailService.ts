import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    // 이메일 전송을 위한 트랜스포터 설정
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
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
      // Telegram 봇 링크
      const botLink = 'https://t.me/KOR_Chall_bot';
      
      // QR 코드 생성
      const qrCodeDataUrl = await QRCode.toDataURL(botLink);
      
      // 이메일 제목
      const subject = isTrial
        ? '한국어 학습 챌린지 무료 체험 시작하기'
        : '한국어 학습 챌린지 시작하기';
      
      // 이메일 내용
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a6cf7; text-align: center;">한국어 학습 챌린지</h1>
          
          <p>안녕하세요, ${name}님!</p>
          
          <p>한국어 학습 챌린지에 참여해 주셔서 감사합니다.</p>
          
          ${isTrial
            ? `<p>무료 체험 기간이 시작되었습니다. ${trialEndDate?.toLocaleDateString()}까지 무료로 서비스를 이용하실 수 있습니다.</p>`
            : `<p>결제가 완료되었습니다. 이제 한국어 학습 챌린지를 시작할 수 있습니다.</p>`
          }
          
          <p>아래 링크를 클릭하거나 QR 코드를 스캔하여 Telegram 봇과 대화를 시작하세요:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${botLink}" style="background-color: #4a6cf7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Telegram 봇 시작하기</a>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <img src="${qrCodeDataUrl}" alt="Telegram Bot QR Code" style="max-width: 200px;" />
          </div>
          
          <p>봇과 대화를 시작한 후, 다음 명령어를 사용하여 챌린지를 시작할 수 있습니다:</p>
          <ul>
            <li><code>/start</code> - 봇 시작하기</li>
            <li><code>/challenge</code> - 챌린지 시작하기</li>
            <li><code>/help</code> - 도움말 보기</li>
          </ul>
          
          <p>문제가 있으시면 언제든지 이 이메일에 회신해 주세요.</p>
          
          <p>감사합니다,<br>한국어 학습 챌린지 팀</p>
        </div>
      `;
      
      // 이메일 전송
      await this.transporter.sendMail({
        from: `"한국어 학습 챌린지" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html: htmlContent,
      });
      
      console.log(`Telegram bot link sent to ${email}`);
    } catch (error) {
      console.error('Error sending Telegram bot link email:', error);
      throw error;
    }
  }
}

export default EmailService; 