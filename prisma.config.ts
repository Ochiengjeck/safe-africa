import { config } from "dotenv";
import { defineConfig, type PrismaConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

// Next.js loads .env.local at runtime; the Prisma CLI does not, so load both here.
config({ path: ".env.local" });
config();

// `adapter` is honored by the CLI at runtime but missing from PrismaConfig's
// public type in 7.8.0, hence the assertion at the bottom.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Direct (non-pooled) Neon endpoint for migrations.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
  // Migrations run through the pg driver adapter (the Rust schema engine's
  // TLS stack cannot reach Neon from this environment).
  adapter: async () => {
    return new PrismaPg({
      connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
    });
  },
} as PrismaConfig);
