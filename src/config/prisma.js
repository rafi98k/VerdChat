const { PrismaPg } = require ("@prisma/adapter-pg");
const {PrismaClient} = require('@prisma/client');

//newer prisma versions require adapters for db connections
const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({adapter});



module.exports = prisma;