import path from "node:path";
import { defineConfig } from "prisma/config";

function getDbUrl() {
  // Production: use Turso URL, with auth token embedded as query param
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  if (tursoUrl) {
    return tursoToken ? `${tursoUrl}?authToken=${tursoToken}` : tursoUrl;
  }
  // Local dev: SQLite file
  const url = process.env.DATABASE_URL;
  if (!url || url.startsWith("file:./")) {
    return `file:${path.resolve(process.cwd(), "dev.db")}`;
  }
  return url;
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: getDbUrl(),
  },
});
