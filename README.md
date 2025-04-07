# Korean Language Learning Challenge Platform
# 한국어 학습 챌린지 플랫폼

This is a platform for learning Korean language through daily challenges and interactions with a Telegram bot.
텔레그램 봇을 통한 일일 챌린지와 상호작용으로 한국어를 학습하는 플랫폼입니다.

## Implemented Features
## 구현된 기능

### User Management
### 사용자 관리
- User registration with email verification
- JWT-based authentication system
- User status management (active/inactive/suspended)
- Protected routes with authentication middleware
- Automatic login after registration

- 이메일 인증을 통한 사용자 등록
- JWT 기반 인증 시스템
- 사용자 상태 관리 (활성/비활성/정지)
- 인증 미들웨어를 통한 보호된 라우트
- 등록 후 자동 로그인

### Subscription System
### 구독 시스템
- Free trial subscription (7 days)
- Premium subscription plans (monthly/yearly)
- Subscription status tracking
- PayPal integration for payments
- Subscription management in admin dashboard

- 무료 체험 구독 (7일)
- 프리미엄 구독 플랜 (월간/연간)
- 구독 상태 추적
- PayPal 결제 연동
- 관리자 대시보드에서 구독 관리

### Admin Dashboard
### 관리자 대시보드
- User management interface
- User status and subscription editing
- Broadcast message functionality
- User activity monitoring
- Protected admin routes with Basic authentication

- 사용자 관리 인터페이스
- 사용자 상태 및 구독 수정
- 브로드캐스트 메시지 기능
- 사용자 활동 모니터링
- Basic 인증을 통한 보호된 관리자 라우트

### Telegram Bot Integration
### 텔레그램 봇 연동
- Automatic bot registration via email
- QR code generation for bot access
- User-bot linking system
- Chat history tracking
- Broadcast message system for active users

- 이메일을 통한 자동 봇 등록
- 봇 접근을 위한 QR 코드 생성
- 사용자-봇 연동 시스템
- 채팅 기록 추적
- 활성 사용자를 위한 브로드캐스트 메시지 시스템

### Email System
### 이메일 시스템
- Welcome email with Telegram bot link
- QR code integration in emails
- HTML email templates
- Subscription status notifications
- Trial expiration notifications

- 텔레그램 봇 링크가 포함된 환영 이메일
- 이메일의 QR 코드 통합
- HTML 이메일 템플릿
- 구독 상태 알림
- 체험판 만료 알림

### Security
### 보안
- JWT-based authentication
- HTTP-only cookies
- Protected API endpoints
- Secure admin authentication
- Rate limiting for API calls

- JWT 기반 인증
- HTTP-only 쿠키
- 보호된 API 엔드포인트
- 보안된 관리자 인증
- API 호출 속도 제한

### Database
### 데이터베이스
- PostgreSQL with Prisma ORM
- User data management
- Subscription tracking
- Chat history storage
- Payment request tracking

- PostgreSQL과 Prisma ORM 사용
- 사용자 데이터 관리
- 구독 추적
- 채팅 기록 저장
- 결제 요청 추적

## Getting Started
## 시작하기

First, set up your environment variables:
먼저 환경 변수를 설정하세요:

```bash
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"

# Telegram
TELEGRAM_BOT_TOKEN="your-bot-token"

# PayPal
PAYPAL_CLIENT_ID="your-client-id"
PAYPAL_CLIENT_SECRET="your-client-secret"

# Admin
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
```

Then, run the development server:
그런 다음 개발 서버를 실행하세요:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## Learn More
## 더 알아보기

To learn more about Next.js, take a look at the following resources:
Next.js에 대해 더 알아보려면 다음 리소스를 참고하세요:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- [Next.js 문서](https://nextjs.org/docs) - Next.js 기능과 API에 대해 알아보기
- [Next.js 배우기](https://nextjs.org/learn) - 대화형 Next.js 튜토리얼

## Deploy on Vercel
## Vercel에 배포하기

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
Next.js 앱을 배포하는 가장 쉬운 방법은 Next.js 제작자가 만든 [Vercel 플랫폼](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)을 사용하는 것입니다.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
자세한 내용은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 참조하세요.

---

# 한국어 학습 챌린지 플랫폼

텔레그램 봇을 통한 일일 챌린지와 상호작용으로 한국어를 학습하는 플랫폼입니다.

## 구현된 기능

### 사용자 관리
- 이메일 인증을 통한 사용자 등록
- JWT 기반 인증 시스템
- 사용자 상태 관리 (활성/비활성/정지)
- 인증 미들웨어를 통한 보호된 라우트
- 등록 후 자동 로그인

### 구독 시스템
- 무료 체험 구독 (7일)
- 프리미엄 구독 플랜 (월간/연간)
- 구독 상태 추적
- PayPal 결제 연동
- 관리자 대시보드에서 구독 관리

### 관리자 대시보드
- 사용자 관리 인터페이스
- 사용자 상태 및 구독 수정
- 브로드캐스트 메시지 기능
- 사용자 활동 모니터링
- Basic 인증을 통한 보호된 관리자 라우트

### 텔레그램 봇 연동
- 이메일을 통한 자동 봇 등록
- 봇 접근을 위한 QR 코드 생성
- 사용자-봇 연동 시스템
- 채팅 기록 추적
- 활성 사용자를 위한 브로드캐스트 메시지 시스템

### 이메일 시스템
- 텔레그램 봇 링크가 포함된 환영 이메일
- 이메일의 QR 코드 통합
- HTML 이메일 템플릿
- 구독 상태 알림
- 체험판 만료 알림

### 보안
- JWT 기반 인증
- HTTP-only 쿠키
- 보호된 API 엔드포인트
- 보안된 관리자 인증
- API 호출 속도 제한

### 데이터베이스
- PostgreSQL과 Prisma ORM 사용
- 사용자 데이터 관리
- 구독 추적
- 채팅 기록 저장
- 결제 요청 추적

## 시작하기

먼저 환경 변수를 설정하세요:

```bash
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"

# Telegram
TELEGRAM_BOT_TOKEN="your-bot-token"

# PayPal
PAYPAL_CLIENT_ID="your-client-id"
PAYPAL_CLIENT_SECRET="your-client-secret"

# Admin
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
```

그런 다음 개발 서버를 실행하세요:

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 더 알아보기

Next.js에 대해 더 알아보려면 다음 리소스를 참고하세요:

- [Next.js 문서](https://nextjs.org/docs) - Next.js 기능과 API에 대해 알아보기
- [Next.js 배우기](https://nextjs.org/learn) - 대화형 Next.js 튜토리얼

## Vercel에 배포하기

Next.js 앱을 배포하는 가장 쉬운 방법은 Next.js 제작자가 만든 [Vercel 플랫폼](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)을 사용하는 것입니다.

자세한 내용은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 참조하세요.
