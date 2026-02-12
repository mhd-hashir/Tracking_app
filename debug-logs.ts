
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching Duty Logs...');
    const logs = await prisma.dutyLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
            employee: {
                select: { id: true, name: true, email: true }
            }
        }
    });

    console.log('Logs found:', logs.length);
    logs.forEach(log => {
        console.log(`[${log.status}] Emp: ${log.employee?.name} (${log.employee?.email}) - ID: ${log.employeeId}`);
        if (!log.employee) {
            console.error('!!! Employee relation missing for log', log.id);
        } else if (!log.employee.name) {
            console.warn('!!! Employee name missing for log', log.id);
        }
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
