import { handle } from "hono/vercel";
import transactions from "../[...route]/transactions";

export const GET = handle(transactions);
export const POST = handle(transactions);
export const PATCH = handle(transactions);
export const DELETE = handle(transactions);
