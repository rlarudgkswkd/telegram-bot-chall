# Korean Language Learning Challenge Platform

This is a platform for learning Korean language through daily challenges and interactions with a Telegram bot.

## Implemented Features

### User Management
- User registration with email verification
- JWT-based authentication system
- User status management (active/inactive/suspended)
- Protected routes with authentication middleware
- Automatic login after registration

### Subscription System
- Free trial subscription (7 days)
- Premium subscription plans (monthly/yearly)
- Subscription status tracking
- PayPal integration for payments
- Subscription management in admin dashboard

### Admin Dashboard
- User management interface
- User status and subscription editing
- Broadcast message functionality
- User activity monitoring
- Protected admin routes with Basic authentication

### Telegram Bot Integration
- Automatic bot registration via email
- QR code generation for bot access
- User-bot linking system
- Chat history tracking
- Broadcast message system for active users

### Email System
- Welcome email with Telegram bot link
- QR code integration in emails
- HTML email templates
- Subscription status notifications
- Trial expiration notifications

### Security
- JWT-based authentication
- HTTP-only cookies
- Protected API endpoints
- Secure admin authentication
- Rate limiting for API calls

### Database
- PostgreSQL with Prisma ORM
- User data management
- Subscription tracking
- Chat history storage
- Payment request tracking

## Getting Started

First, set up your environment variables:

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

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
