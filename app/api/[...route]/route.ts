
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from 'hono/cors';

import  summary from "./summary";
import accounts from "./accounts";
import  categories from "./categories";
import  transactions from "./transactions";

export const runtime = "edge"



const app = new Hono().basePath("/api")
// Add CORS middleware for your Vercel frontend domain
app.use('*', cors({
    origin: 'https://personal-finance-6yzca1oqm-atmiya124s-projects.vercel.app',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));

// Global error handler middleware
app.onError((err, c) => {
    console.error("API Error:", err);
    return c.json({ error: "Internal Server Error", details: err.message }, 500);
});


app
    .route("/summary", summary)
    .route("/accounts", accounts)
    .route("/categories", categories)
    .route("/transactions", transactions);


export type AppType = typeof app;
export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

