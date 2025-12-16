import {z} from "zod";
import { Hono } from "hono";
import { createId } from "@paralleldrive/cuid2";
import { zValidator } from "@hono/zod-validator";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

import { db } from "@/db/drizzle";
import { transactions, categories, accounts } from "@/db/schema";
// Define a plain Zod schema for API validation
const transactionApiSchema = z.object({
    date: z.string(),
    amount: z.number().int(),
    payee: z.string(),
    notes: z.string().nullable().optional(),
    accountId: z.string(),
    categoryId: z.string().nullable().optional(),
});


import { parse, subDays } from "date-fns"
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";

const app = new Hono()
    .get(
        "/", 
        zValidator("query", z.object({
            from: z.string().optional(),
            to: z.string().optional(),
            accountId: z.string().optional(),
        })),
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            const{ from, to, accountId } = c.req.valid("query");

            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401);
            }


            // Build dynamic date filters
            let dateFilters = [];
            if (from) {
                const startDate = parse(from, "yyyy-MM-dd", new Date());
                dateFilters.push(gte(transactions.date, startDate));
            }
            if (to) {
                const endDate = parse(to, "yyyy-MM-dd", new Date());
                dateFilters.push(lte(transactions.date, endDate));
            }

            const data = await db 
                .select({
                    id: transactions.id,
                    date: transactions.date,
                    category: categories.name,
                    categoryId: transactions.categoryId,
                    payee: transactions.payee,
                    amount: transactions.amount,
                    notes: transactions.notes,
                    account: accounts.name, 
                    accountId: transactions.accountId,
                })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .leftJoin(categories, eq(transactions.categoryId, categories.id))
                .where(
                    and(
                        accountId ? eq(transactions.accountId, accountId) : undefined,
                        eq(accounts.userId, auth.userId),
                        ...dateFilters
                    )
                )
                .orderBy(desc(transactions.date));

            return c.json({ data });
        })
    .get(
        "/:id",
        zValidator("param", z.object({
            id: z.string().optional(),
        })),
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!id) {
                return c.json({ error: "Missing id" }, 400);
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [ data ] = await db   
                .select({
                    id: transactions.id,
                    date: transactions.date,
                    categoryId: transactions.categoryId,
                    payee: transactions.payee,
                    amount: transactions.amount,
                    notes: transactions.notes,
                    accountId: transactions.accountId,
                })
                .from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(
                    and(
                        eq(transactions.id, id),
                        eq(accounts.userId, auth.userId),
                    ),
                );
                
            if (!data) {
                return c.json({ error: "Not Found" }, 401);
            }
            
            return c.json({ data });
        }
    )
    .post(
        "/", 
        clerkMiddleware(),
        zValidator("json", transactionApiSchema),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401);
            }

            try {
                const [data] = await db.insert(transactions).values({
                    id: createId(),
                    ...values,
                    date: new Date(values.date),
                }).returning();
                return c.json({ data });
            } catch (error) {
                return c.json({ error: "Failed to create transaction", details: (error && typeof error === "object" && "message" in error) ? (error as { message?: string }).message : String(error) }, 500);
            }
    }) 
    .post(
        "/bulk-create",
        clerkMiddleware(),
        zValidator(
            "json",
            z.array(transactionApiSchema),
        ),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401);
            }

            const data = await db
                .insert(transactions)
                .values(
                    values.map((value) => ({
                        id: createId(),
                        ...value,
                        date: new Date(value.date),
                    }))
                )
                .returning();
            return c.json({ data });
        }
    ) 
    .post (
        "/bulk-delete",
        clerkMiddleware(),
        zValidator(
            "json",
            z.object({
                ids: z.array(z.string()),
            }),
        ),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if(!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401)
            }

            const transactionsToDelete = db.$with("trasactions_to_delete").as(
                db.select({ id: transactions.id }).from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(and(
                    inArray(transactions.id, values.ids),
                    eq(accounts.userId, auth.userId),
                ))
            )

            const data = await db
            .with(transactionsToDelete)
                .delete(transactions)
                .where(
                    inArray(transactions.id, sql`(select id from ${transactionsToDelete})`)
                )
                .returning({
                    id: transactions.id,
                });
                
            return c.json({ data });
        }
    )
    .patch (
        "/:id",
        clerkMiddleware(),
        zValidator(
            "param",
            z.object({
                id: z.string().optional(),
            }),
        ),
        zValidator(
            "json",
            transactionApiSchema,
        ),

        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");
            const values = c.req.valid("json");

            if (!id) {
                return c.json({ error: "Missing id" }, 400)
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized"}, 401)
            }

            const transactionsToUpdate = db.$with("trasactions_to_update").as(
                db.select({ id: transactions.id }).from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(and(
                    eq(transactions.id, id),
                    eq(accounts.userId, auth.userId),
                ))
            )

            const [ data ] = await db
                .with(transactionsToUpdate)
                .update(transactions)
                .set({
                    ...values,
                    date: new Date(values.date),
                })
                .where(
                    inArray(transactions.id, sql`(select id from ${transactionsToUpdate})`)
                )
                .returning();

            if (!data) {
                return c.json({ error: "Not Found" }, 404)
            }

            return c.json({ data });
        },
    )
    .delete (
        "/:id",
        clerkMiddleware(),
        zValidator(
            "param",
            z.object({
                id: z.string().optional(),
            }),
        ),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!id) {
                return c.json({ error: "Missing id" }, 400)
            }

            if (!auth?.userId) {
                return c.json({ error: "Unauthorized"}, 401)
            }

            const transactionsToDelete = db.$with("trasactions_to_delete").as(
                db.select({ id: transactions.id }).from(transactions)
                .innerJoin(accounts, eq(transactions.accountId, accounts.id))
                .where(and(
                    eq(transactions.id, id),
                    eq(accounts.userId, auth.userId),
                ))
            )

            const [ data ] = await db
                .with(transactionsToDelete)
                .delete(transactions)
                .where(
                    inArray(transactions.id, sql`(select id from ${transactionsToDelete})`)
                )
                .returning({
                    id: transactions.id,
                })

            if (!data) {
                return c.json({ error: "Not Found" }, 404)
            }

            return c.json({ data });
        },
    );

export default app;