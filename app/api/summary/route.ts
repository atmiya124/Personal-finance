import { handle } from "hono/vercel";
import summary from "../[...route]/summary";

export const GET = handle(summary);
export const POST = handle(summary);
export const PATCH = handle(summary);
export const DELETE = handle(summary);
