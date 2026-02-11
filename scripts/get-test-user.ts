
import { prisma } from '../src/lib/db';

async function main() {
    const employee = await prisma.user.findFirst({
        where: { role: 'EMPLOYEE' }
    });

    if (employee) {
        console.log(`Found Employee: ${employee.email}`);
        // We can't see the password, but hopefully the user knows it or we can reset it.
        // Actually, for testing I might need to create a temp user with known password if I don't know it.
        // Let's create one just to be sure.

        // Check if test employee exists
        const testEmail = 'test_mobile@example.com';
        let testUser = await prisma.user.findUnique({ where: { email: testEmail } });

        if (testUser) {
            // Force update password to ensure it matches
            const { hashPassword } = await import('../src/lib/auth');
            const hashedPassword = await hashPassword('password123');
            await prisma.user.update({
                where: { email: testEmail },
                data: { password: hashedPassword }
            });
            console.log('Updated test user password: test_mobile@example.com / password123');
        } else {
            const { hashPassword } = await import('../src/lib/auth');
            const hashedPassword = await hashPassword('password123');
            testUser = await prisma.user.create({
                data: {
                    email: testEmail,
                    password: hashedPassword,
                    role: 'EMPLOYEE',
                    name: 'Mobile Test User',
                    isOnDuty: false
                }
            });
            console.log('Created test user: test_mobile@example.com / password123');
        }
    } else {
        console.log('No employees found. Creating one...');
        const { hashPassword } = await import('../src/lib/auth');
        const hashedPassword = await hashPassword('password123');
        await prisma.user.create({
            data: {
                email: 'test_mobile@example.com',
                password: hashedPassword,
                role: 'EMPLOYEE',
                name: 'Mobile Test User',
                isOnDuty: false
            }
        });
        console.log('Created test user: test_mobile@example.com / password123');
    }
}

main().catch(console.error);
