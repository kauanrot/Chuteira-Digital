const { PrismaClient } = require('@prisma/client');

let prisma;

/** PrismaClient unico por processo (usa DATABASE_URL). */
function getPrisma() {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

module.exports = { getPrisma };
