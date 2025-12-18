import { handle } from "hono/vercel";
import accounts from "../[...route]/accounts";

export const GET = handle(accounts);
export const POST = handle(accounts);
export const PATCH = handle(accounts);
export const DELETE = handle(accounts);
