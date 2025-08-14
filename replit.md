# AI Sosyal Medya Planlayıcı

## Overview

AI Sosyal Medya Planlayıcı is a comprehensive social media content management and planning platform built with AI capabilities. The system enables users to generate content ideas using AI, create custom visuals, schedule posts, and manage all their social media accounts from a single interface. The platform includes a freemium subscription model with Stripe integration and supports multiple social media platforms through Buffer API integration.

## User Preferences

Preferred communication style: Simple, everyday language.

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
Primary integration through Zapier/Make webhooks (Pro feature) with Buffer API as fallback. When ZAPIER_HOOK_URL is configured, the system sends posts to Zapier webhook endpoints for flexible social media automation. Buffer integration disabled when Zapier is active. Supports Instagram, LinkedIn, Twitter/X, and TikTok platforms with scheduling via node-cron.

### Payment Processing
Subscription management is implemented using Stripe with support for both one-time payments and recurring subscriptions. The system handles webhook events for subscription status updates and includes proper plan-based feature gating.

### Job Scheduling
The application includes a background job scheduler using node-cron for processing scheduled posts, updating social media statuses, and handling recurring tasks. The scheduler is designed to be resilient with proper error handling and logging.

## External Dependencies

### Third-Party Services
- **OpenAI API**: Powers content generation through GPT-4o for text and DALL-E 3 for images
- **Buffer API**: Handles social media post scheduling and publishing across multiple platforms
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