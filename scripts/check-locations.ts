
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const employees = await prisma.user.findMany({
        where: { role: 'EMPLOYEE' },
        select: { id: true, name: true, isOnDuty: true, lastLatitude: true, lastLongitude: true, lastLocationUpdate: true }
    });
    console.log(JSON.stringify(employees, null, 2));
}

check();
