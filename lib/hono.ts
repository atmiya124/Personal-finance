
import { hc } from "hono/client";
export const client = hc(process.env.NEXT_PUBLIC_APP_URL!);

