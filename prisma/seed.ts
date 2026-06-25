import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const quotes = [
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Motivation" },
  { content: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "Wisdom" },
  { content: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "Motivation" },
  { content: "The unexamined life is not worth living.", author: "Socrates", category: "Wisdom" },
  { content: "Be yourself; everyone else is already taken.", author: "Oscar Wilde", category: "Life" },
  { content: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.", author: "Albert Einstein", category: "Humor" },
  { content: "To love and be loved is to feel the sun from both sides.", author: "David Viscott", category: "Love" },
  { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Success" },
  { content: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "Life" },
  { content: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "Motivation" },
  { content: "You only live once, but if you do it right, once is enough.", author: "Mae West", category: "Life" },
  { content: "Be the change you wish to see in the world.", author: "Mahatma Gandhi", category: "Wisdom" },
];

async function main() {
  console.log("Seeding database...");
  for (const q of quotes) {
    await prisma.quote.create({ data: q });
  }
  console.log(`Seeded ${quotes.length} quotes.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
