import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";

import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

import { serverRouter, createContext } from "@repo/trpc/server";

import { env } from "./env";

export const app = express();

// Trust proxy (for correct IP behind load balancers)
app.set("trust proxy", 1);

// CORS
const allowedOrigins = Array.from(
  new Set([
    env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    ...(env.CORS_ORIGINS ? env.CORS_ORIGINS.split(",").map((o) => o.trim()) : []),
  ])
);

logger.info("CORS allowed origins", { allowedOrigins });

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-side / curl requests that have no Origin header
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    logger.warn(`CORS blocked origin: ${origin}`);
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Respond to all OPTIONS preflight requests BEFORE rate limiters
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// General rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Stricter rate limit for public form submissions
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions. Please try again later." },
  keyGenerator: (req) =>
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.ip ??
    "unknown",
});

// Auth rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again later." },
});

app.use(generalLimiter);

const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "DexterForms API",
  version: "1.0.0",
  description:
    "DexterForms — Form Builder SaaS API. Build dynamic forms, collect responses, and analyze data.",
  baseUrl: env.BASE_URL.concat("/api"),
  tags: [
    { name: "Authentication", description: "User registration, login and auth" },
    { name: "Forms", description: "Form creation and management" },
    { name: "Form Fields", description: "Manage form fields" },
    { name: "Responses", description: "View and manage responses" },
    { name: "Public", description: "Public form access and submission" },
    { name: "Themes", description: "Available form themes" },
  ],
});

app.get("/", (_req, res) => {
  return res.json({
    message: "DexterForms API is running 🍵",
    docs: `${env.BASE_URL}/docs`,
    version: "1.0.0",
  });
});

app.get("/health", (_req, res) => {
  return res.json({ message: "DexterForms API is healthy", healthy: true });
});

// REST logout — clears the httpOnly cookie. Used by the frontend auth provider.
app.post("/logout", (_req, res) => {
  res.clearCookie("df_token", { path: "/" });
  return res.json({ success: true });
});

logger.debug(`OpenAPI JSON: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (_req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`API Docs: ${env.BASE_URL}/docs`);
app.use(
  "/docs",
  apiReference({
    url: "/openapi.json",
    theme: "purple",
    layout: "modern",
  })
);

// Apply auth rate limiting to auth endpoints
app.use("/api/authentication", authLimiter);

// Apply submit rate limiting to public submission endpoint only (not form reads)
app.use("/trpc/public.submitResponse", submitLimiter);
app.use("/trpc/auth.login", authLimiter);
app.use("/trpc/auth.register", authLimiter);

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
    onError: ({ error }) => {
      logger.error("OpenAPI error", { error });
    },
  })
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
    onError: ({ error }) => {
      logger.error("tRPC error", { error: error.message });
    },
  })
);

export default app;
