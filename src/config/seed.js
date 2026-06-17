const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function getuser(){
  const users = await prisma.user.findMany();
  return users[7].id;
}

async function main() {

/*  const record = await prisma.message.create({
    data :{
      content : "This is a threat",
      userId : "93dc6fc1-117c-4f04-aaa6-b39af5975960",
      roomId : 1,
    },
  });*/
    const record = await prisma.message.deleteMany({
    where :{
      roomId :4,
    },
  });

  console.log(record);


}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());