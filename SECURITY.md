# Security & Deployment Guide

## 🔒 Security Implementation

### Authentication & Authorization

#### 1. Password Security
```typescript
// bcrypt with 12 salt rounds for strong hashing
const salt = await bcrypt.genSalt(12);
const hashedPassword = await bcrypt.hash(password, salt);
```

**Best Practices:**
- Minimum 8 characters
- Requires uppercase, lowercase, and numbers
- Passwords never stored in plain text
- Passwords excluded from API responses using Mongoose `select: false`

#### 2. JWT Token Management
```typescript
// Token expires in 7 days
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '7d',
  issuer: 'task-manager-app',
});
```

**Security Considerations:**
- Tokens signed with strong secret (256-bit minimum)
- Include issuer verification
- Short expiration time for production (consider refresh tokens)
- Store securely (httpOnly cookies recommended for production)

#### 3. Input Validation
All user inputs validated using Zod schemas:

```typescript
export const registerSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});
```

#### 4. Input Sanitization
```typescript
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove JS protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}
```

#### 5. Rate Limiting
```typescript
// Login: 10 requests per 15 minutes
const rateLimit = checkRateLimit(`login:${ip}`, 10, 900000);

// Register: 5 requests per hour
const rateLimit = checkRateLimit(`register:${ip}`, 5, 3600000);
```

**Production Enhancement:**
Consider using Redis for distributed rate limiting:
```bash
npm install @upstash/redis @upstash/ratelimit
```

### API Security

#### 1. Protected Routes
```typescript
// All task endpoints require authentication
export const GET = withAuth(async (request, user) => {
  // Only returns tasks for authenticated user
  const tasks = await Task.find({ userId: user.userId });
});
```

#### 2. MongoDB Injection Prevention
- Use Mongoose parameterized queries
- Never concatenate user input into queries
- Validate all ObjectIds

#### 3. CORS Configuration
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE' },
        ],
      },
    ];
  },
};
```

### Environment Variables

**Never commit sensitive data!**

```env
# ❌ Bad
JWT_SECRET=mysecret123

# ✅ Good
JWT_SECRET=$(openssl rand -base64 32)
```

**Generate secure secrets:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 🚀 Deployment Guide

### Vercel Deployment

#### 1. Prepare for Production

**a) Update Environment Variables**
Create production `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager?retryWrites=true&w=majority
JWT_SECRET=<generated-strong-secret>
NEXTAUTH_SECRET=<generated-strong-secret>
NEXTAUTH_URL=https://your-domain.vercel.app
NODE_ENV=production
```

**b) Optimize Build**
```bash
# Test production build locally
npm run build
npm start
```

#### 2. Deploy to Vercel

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Option B: GitHub Integration**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Configure environment variables
5. Deploy

#### 3. Configure MongoDB Atlas

**a) Whitelist Vercel IPs**
```
MongoDB Atlas → Network Access → Add IP Address
Enter: 0.0.0.0/0 (All IPs)
Note: For better security, use Vercel's specific IP ranges
```

**b) Create Database User**
```
MongoDB Atlas → Database Access → Add New User
Username: vercel-app
Password: <strong-generated-password>
Roles: Read and write to any database
```

#### 4. Set Environment Variables in Vercel

```bash
# Via CLI
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Via Dashboard
# Project → Settings → Environment Variables → Add
```

### GitHub Actions Setup

#### 1. Add Secrets to GitHub
```
Repository → Settings → Secrets and variables → Actions → New repository secret
```

Required secrets:
- `MONGODB_URI`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`
- `VERCEL_TOKEN` (from Vercel dashboard)
- `VERCEL_ORG_ID` (from Vercel project settings)
- `VERCEL_PROJECT_ID` (from Vercel project settings)

#### 2. Pipeline Stages

The CI/CD pipeline runs:
1. **Lint** - Code quality checks
2. **Test** - Unit tests
3. **E2E** - End-to-end tests
4. **Build** - Production build
5. **Deploy** - Deploy to Vercel (main branch only)

### Performance Optimization

#### 1. Enable Caching
```typescript
// API Route with caching
export const GET = async (request: NextRequest) => {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
};
```

#### 2. Database Indexing
Already implemented in Task model:
```typescript
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
```

#### 3. Image Optimization
```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

## 🔍 Monitoring & Logging

### Error Tracking

**Option 1: Sentry**
```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

**Option 2: Custom Logging**
```typescript
// lib/logger.ts
export function logError(error: Error, context: any) {
  console.error({
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
  
  // Send to logging service
  // await fetch('https://your-logging-service.com/log', { ... });
}
```

### Performance Monitoring

**Vercel Analytics**
```bash
npm install @vercel/analytics

# Add to layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## 📊 Database Backup

### MongoDB Atlas Automated Backups

1. Navigate to MongoDB Atlas cluster
2. Backup → Enable Cloud Backup
3. Configure retention policy:
   - Continuous backups
   - Snapshot schedule (every 12 hours)
   - Retention: 7 days

### Manual Backup
```bash
# Export database
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/taskmanager" --out=./backup

# Import database
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/taskmanager" ./backup
```

## 🧪 Production Checklist

- [ ] Environment variables set in Vercel
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Strong JWT secrets generated (256-bit)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Rate limiting configured
- [ ] Error monitoring setup (Sentry/LogRocket)
- [ ] Database backups enabled
- [ ] GitHub Actions secrets configured
- [ ] Custom domain configured (optional)
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Tests passing (npm test)
- [ ] E2E tests passing (npm run test:e2e)
- [ ] Build successful (npm run build)
- [ ] Performance audit (Lighthouse score > 90)

## 🔄 Continuous Improvement

### Regular Maintenance
- Update dependencies monthly: `npm update`
- Review security advisories: `npm audit`
- Monitor error rates in production
- Review database query performance
- Check API response times
- Update documentation

### Security Updates
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# For breaking changes
npm audit fix --force
```

## 📞 Support & Troubleshooting

### Common Issues

**1. MongoDB Connection Fails**
```
Error: MongooseServerSelectionError
Solution: Check IP whitelist and connection string
```

**2. JWT Verification Fails**
```
Error: Invalid or expired token
Solution: Verify JWT_SECRET matches between client and server
```

**3. Build Fails on Vercel**
```
Error: Type errors during build
Solution: Run `npm run build` locally to identify issues
```

### Debug Mode
```env
# Enable debug logging
DEBUG=*
NODE_ENV=development
```

---

**Last Updated:** October 21, 2025
