import { handle } from "hono/vercel";
import categories from "../[...route]/categories";

export const GET = handle(categories);
export const POST = handle(categories);
export const PATCH = handle(categories);
export const DELETE = handle(categories);
