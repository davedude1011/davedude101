import { type Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  tablesFilter: ["davedude101_*"],
} satisfies Config;
