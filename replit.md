# SocialSparkAI - AI Destekli Sosyal Medya İçerik Platformu

## Overview

SocialSparkAI, yapay zeka destekli sosyal medya içerik üretme ve yayınlama platformudur. Kullanıcılar tek bir arayüzden AI ile içerik üretebilir, düzenleyebilir ve Zapier webhook entegrasyonu ile otomatik olarak sosyal medya platformlarına gönderebilir.

### Temel Özellikler:
- **AI İçerik Üretimi**: OpenAI API ile otomatik metin ve görsel üretimi
- **Tek Tık Paylaşım**: Zapier webhook ile Facebook, Instagram, Twitter, LinkedIn'e otomatik paylaşım
- **Abonelik Sistemi**: İyzico ödeme entegrasyonu ile pro/abonelik modeli (aylık ücretli sınırsız gönderi hakkı)
- **Çoklu Platform Desteği**: Tüm ana sosyal medya platformları için optimize edilmiş içerik
- **Merkezi Yönetim**: Tek arayüzden tüm sosyal medya hesaplarını yönetme

## User Preferences

Preferred communication style: Simple, everyday language.

## Project Vision (Updated)

SocialSparkAI core mission: Enable users to generate AI-powered social media content and automatically publish it across multiple platforms through a single interface. Key workflow:

1. User creates account with subscription model (İyzico payment)
2. AI generates content ideas and captions using OpenAI API
3. DALL-E 3 integration for AI image generation
4. User can edit/customize the generated content
5. One-click publishing to social media via Zapier webhook automation
6. Supports all major platforms: Facebook, Instagram, Twitter, LinkedIn, TikTok

Business model: Monthly subscription for unlimited AI content generation and publishing rights.

## Recent Progress (August 14, 2025)

✅ **PHASE 1: Core User Workflow** - Completed with optimized landing page and dashboard
✅ **PHASE 2: AI Image Generation** - DALL-E 3 integration with 3-tab AI Content workflow
✅ **PHASE 3: Social Media Publishing** - Zapier webhook optimization and enhanced post creation
✅ **PHASE 5: AUTONOMOUS AI MONITORING SYSTEM** - **FULLY OPERATIONAL** (August 14, 2025)

### 🤖 **AUTONOMOUS SYSTEM STATUS: ACTIVE**
- Health monitoring every 5 minutes ✅
- AI analysis with GPT-4o every 15 minutes ✅  
- Emergency response every 2 minutes ✅
- Daily maintenance at 2 AM ✅
- Auto-fixing without human approval ✅
- Complete API control dashboard ✅

**Last Verified**: August 14, 2025 06:33 UTC - All systems operational
**Test Results**: All API endpoints responding, scheduled tasks active, real-time monitoring confirmed

Current Status: Complete autonomous AI-powered platform with self-monitoring, self-healing, and continuous optimization capabilities. The system now operates independently to maintain and improve itself without human intervention.

## Development Phases Completed

**PHASE 1: Core User Workflow** ✅
- Landing page optimization
- Dashboard with plan-based daily limits
- User authentication and basic navigation

**PHASE 2: AI Image Generation** ✅  
- DALL-E 3 integration for image generation
- 3-tab AI Content workflow (Ideas → Captions → Images)
- Seamless workflow connections between tabs

**PHASE 3: Social Media Publishing** ✅
- Zapier webhook integration (200 OK status confirmed)
- Enhanced post creation with platform-specific guidance
- End-to-end workflow: AI generation → Post creation → Zapier publishing

**PHASE 4: Subscription System** ✅ Completed
- İyzico payment integration with fallback system
- Enhanced billing page with feature comparison & FAQ
- Payment success handling and subscription status
- Complete subscription management workflow

## System Architecture

### Frontend Architecture
The client-side application is built using modern React 18 with TypeScript, utilizing Vite as the build tool for optimized development and production builds. The UI framework leverages TailwindCSS for styling combined with shadcn/ui components for a consistent design system. Form management is handled through React Hook Form with Zod validation, while state management and server communication uses TanStack Query (React Query) for efficient data fetching and caching.

### Backend Architecture
The server-side implementation uses Node.js with Express.js framework, written entirely in TypeScript for type safety. The application follows a service-oriented architecture with clear separation between routes, controllers, middleware, and services. The API implements RESTful endpoints with comprehensive error handling and validation.

### Data Storage Solutions
The application uses Drizzle ORM with PostgreSQL (Replit native database) for production-ready database operations. The database includes 7 tables: users, social_accounts, content_ideas, post_assets, subscriptions, api_usage, and sessions. The schema supports multi-tenancy, JWT authentication sessions, and includes proper indexing for performance optimization. Database migration handled via `npm run db:push`.

### Authentication and Authorization
Security is implemented through JWT-based authentication with bcrypt for password hashing. The system includes comprehensive middleware for token validation, rate limiting (both user-based and IP-based), and plan-based feature access control. Additional security measures include Helmet for HTTP headers, CORS configuration, and Express rate limiting.

### Content Generation Services
AI-powered content generation is handled through OpenAI's APIs, specifically using GPT-4o for text generation and DALL-E 3 for image creation. The system includes intelligent prompting strategies tailored for different social media platforms (Instagram, LinkedIn, Twitter/X, TikTok) with customizable tone and target audience parameters.

### Social Media Integration
Primary integration through Zapier webhooks (Pro feature). Users configure Zapier automations to connect with Facebook, Instagram, Twitter, LinkedIn and other platforms. When ZAPIER_HOOK_URL is configured, the system sends posts to Zapier webhook endpoints for flexible social media automation. Buffer API integration was cancelled in favor of Zapier's more flexible approach.

### Payment Processing
Subscription management planned for İyzico integration with support for recurring subscriptions (monthly unlimited post access). Currently using Stripe for development/testing. The system handles webhook events for subscription status updates and includes proper plan-based feature gating.

## External Dependencies

### Third-Party Services
- **OpenAI API**: Powers content generation through GPT-4o for text and DALL-E 3 for images
  - **Zapier Webhook**: Handles social media post forwarding across multiple platforms
- **Stripe**: Manages subscription billing, payment processing, and customer management
- **Replit PostgreSQL**: Native Replit database with automatic provisioning and environment variables

### Key Libraries and Frameworks
- **React 18 + TypeScript**: Frontend framework with type safety
- **Vite**: Build tool for optimized development and production builds
- **TailwindCSS + shadcn/ui**: UI framework and component library
- **Drizzle ORM**: Type-safe database operations with PostgreSQL support
- **TanStack Query**: Server state management and data fetching
- **React Hook Form + Zod**: Form handling with validation
- **JWT + bcrypt**: Authentication and password security
- **Express + Helmet + CORS**: Backend framework with security middleware
- **node-cron**: Job scheduling for automated tasks

### Development Tools
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundling for production
- **Drizzle Kit**: Database migration and schema management
- **Wouter**: Lightweight client-side routing