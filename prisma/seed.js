const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const existingAdmin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await prisma.user.create({
            data: {
                name: 'Admin',
                email: 'admin@beautybook.com',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        console.log('✅ Admin user created!');
    } else {
        console.log('ℹ️ Admin user already exists.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
