const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendEmail } = require('../utils/sendEmail')
const bcrypt = require('bcrypt');


const getAllStaff = async (req, res) => {
    const { all } = req.query;
    const isAllRequested = all === 'true';

    try {
        let queryOptions = {
            where: {
                role: 'STAFF'
            },
            select: {
                id: true,
                name: true,
                email: true,
                isDeleted: true
            }
        };
        if (isAllRequested) {
            queryOptions.orderBy = {
                isDeleted: 'asc'
            };
        } else {
            queryOptions.where.isDeleted = false;
        }

        const users = await prisma.user.findMany(queryOptions);
        res.json(users);

    } catch (error) {
        console.error("Failed to get staff:", error);
        res.status(500).json({ message: "An error occurred while fetching staff data." });
    }
};


const getOneStaff = async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: +req.params.id } });
    if (!user || user.role !== 'STAFF') return res.status(404).json({ message: 'Not found' });
    res.json(user);
};

const removeStaff = async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: +req.params.id } });
    if (!user || user.role !== 'STAFF') {
        return res.status(404).json({ message: 'Not found' });
    }

    await prisma.user.update({
        where: { id: +req.params.id },
        data: { isDeleted: true },
    });

    res.json({ message: 'Soft deleted' });
};
const restoreStaff = async (req, res) => {
    const { id } = req.body;
    const user = await prisma.user.findUnique({ where: { id: +id } });
    if (!user || user.role !== 'STAFF') {
        return res.status(404).json({ message: 'Not found' });
    }

    await prisma.user.update({
        where: { id: +id },
        data: { isDeleted: false },
    });

    res.json({ message: 'Restored' });
};

const addStaff = async (req, res) => {
    const { name, email, role } = req.body;
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { name }]
        }
    });

    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const password = "1234"
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role || 'STAFF',
        }
    });
    const link = ` http://localhost:3000/set-password/${user.id}`;
    await sendEmail(user.email, "Welcome!", `Click here to set your password: ${link}`);

    res.status(201).json(user);
}


module.exports = { getAllStaff, getOneStaff, removeStaff, restoreStaff, addStaff };
