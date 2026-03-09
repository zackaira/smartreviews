import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use the DIRECT_URL for Prisma CLI / migrations to bypass the connection pooler.
    // At runtime, PrismaClient uses the adapter configured in src/lib/prisma.ts.
    url: env("DIRECT_URL"),
  },
});
