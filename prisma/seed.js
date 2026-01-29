
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
    const adminEmail = 'admin@fieldtrack.com'
    const adminPass = 'admin123'

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    })

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPass, 10)
        await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: 'Super Admin',
                role: 'ADMIN'
            }
        })
        console.log('Admin created: ' + adminEmail)
    } else {
        console.log('Admin already exists')
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
