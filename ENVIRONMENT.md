# Environment Setup

This project uses environment variables to configure server and client behavior. Copy `.env.example` to `.env` and fill in the values described below.

## Server
- `NODE_ENV` – runtime mode (`development` or `production`).
- `PORT` – port for the HTTP server (default `5000`).
- `DATABASE_URL` – connection string for the database; defaults to a local SQLite file (`file:./dev.db`).
- `JWT_SECRET` – secret used to sign JSON Web Tokens.
- `OPENAI_API_KEY` – API key for OpenAI services.
- `IYZICO_API_KEY` – Iyzico API key for payments.
- `IYZICO_SECRET_KEY` – secret key for Iyzico payments.
- `IYZICO_BASE_URL` – base URL for the Iyzico API (sandbox by default).
- `ZAPIER_HOOK_URL` – optional Zapier webhook URL for publishing.

## Client
- `VITE_API_BASE_URL` – API base URL used by the frontend (e.g., `http://localhost:5000`).

Ensure all required keys are provided before running `npm run dev` or deploying the application.
