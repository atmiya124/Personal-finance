import { db } from "@/db/drizzle";
import { and, desc, eq, gte, lt, lte, sql } from "drizzle-orm";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { accounts,categories,transactions } from "@/db/schema";
import { subDays, parse, differenceInDays } from "date-fns"; // <-- Add this
import { calculatePercantageChange, fillMissingDays } from "@/lib/utils";

const app = new Hono()
  .get(
    "/",
    clerkMiddleware(),
    zValidator(
      "query",
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    async (c) => {

      const auth = getAuth(c);
      const { from, to, accountId } = c.req.valid("query");

      // Safe: check for null or missing userId
      if (!auth || !auth.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);

      const startDate = from ? parse(from, "yyyy-MM-dd", new Date()) : defaultFrom;
      const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

      const peroidLength = differenceInDays(endDate, startDate);
      const lastperodStart = subDays(startDate, peroidLength);
      const lastperodEnd = subDays(endDate, peroidLength);

      async function fetchFinancialData(
        userId: string,
        startDate: Date,
        endDate: Date
      ) {
        return await db
          .select({
            income: sql`COALESCE(SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END), 0)`.mapWith(Number),
            expenses: sql`COALESCE(SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END), 0)`.mapWith(Number),
            remaining: sql`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(Number),
          })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(
              accountId ? eq(transactions.accountId, accountId ) : undefined,
              eq(accounts.userId, userId),
              gte(transactions.date, startDate),
              lte(transactions.date, endDate)
            )
          );
      } // <-- Closing brace added here

      const [currentPeriod] = await fetchFinancialData(
        auth.userId,
        startDate,
        endDate,
      );
      const [lastPeriod] = await fetchFinancialData(
        auth.userId,
        lastperodStart,
        lastperodEnd,
      );

      const incomeChange = calculatePercantageChange(currentPeriod.income, lastPeriod.income);
      const expensesChange = calculatePercantageChange(currentPeriod.expenses, lastPeriod.expenses);
      const remainingChange = calculatePercantageChange(currentPeriod.remaining, lastPeriod.remaining);

      const category = await db
        .select(
          {
            name: categories.name,
            value: sql`COALESCE(SUM(ABS(${transactions.amount})))`.mapWith(Number),
          }
        )
        .from(transactions)
        .innerJoin(
          accounts,
          eq(transactions.accountId, accounts.id)
        )
        .innerJoin(
          categories,
          eq(transactions.categoryId, categories.id),
        )
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId ) : undefined,
            eq(accounts.userId, auth.userId),
            lt(transactions.amount, 0),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
          )
        )
        .groupBy(categories.name)
        .orderBy(desc(sql`SUM(ABS(${transactions.amount}))`))
        // .limit(5);

        const topCategoreis = category.slice(0,3);
        const otherCategories = category.slice(3);
        const otherSum = otherCategories
          .reduce((sum, current) => sum + current.value, 0);

        // const finalCategories = topCategoreis;
        // if (otherSum > 0) {
        //   finalCategories.push({
        //     name: "Other",
        //     value: otherSum,
        //   });
        // }

        let finalCategories: { name: string; value: number }[];

        if (topCategoreis.length > 0) {
          finalCategories = [...topCategoreis];
          if (otherSum > 0) {
            finalCategories.push({
              name: "Other",
              value: otherSum,
            });
          }
        } else {
          finalCategories = [{ name: "No expenses in this period", value: 0 }];
        }

        const activeDays = await db
          .select ({
            date: transactions.date,
            income: sql`COALESCE(SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END), 0)`.mapWith(Number),
            expenses: sql`COALESCE(SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END), 0)`.mapWith(Number),
            // remaining: sql`COALESCE(SUM(${transactions.amount}), 0)`.mapWith(Number),
          })
          .from(transactions)
          .innerJoin(
            accounts,
            eq(transactions.accountId, accounts.id)
          )
          .innerJoin(
            categories,
            eq(transactions.categoryId, categories.id),
          )
          .where(
            and(
              accountId ? 
              eq(transactions.accountId, accountId ) 
                : undefined,
              eq(accounts.userId, auth.userId),
              gte(transactions.date, startDate),
              lte(transactions.date, endDate),
            )
          )
          .groupBy(transactions.date)
          .orderBy(transactions.date);

          const days = fillMissingDays(
            activeDays,
            startDate,
            endDate
          );

      return c.json({
        data: {
          remainingAmount: currentPeriod.remaining,
          remainingChange,
          incomeAmount: currentPeriod.income,
          incomeChange,
          expensesAmount: currentPeriod.expenses,
          expensesChange,
          categories: finalCategories,
          days,
        },
      });
    },
  );

export default app.handler;