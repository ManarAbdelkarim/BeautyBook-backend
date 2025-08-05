const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
    const { email, password, role, name } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already used' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { email, name, password: hashed, role: role || 'STAFF' },
    });

    res.status(201).json({ message: 'User registered successfully' });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    const token = generateToken(user);
    res.json({ token });
};

const resetPassword = async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ message: 'Password is required.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(id, 10),
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: {
                id: parseInt(id, 10),
            },
            data: {
                password: hashedPassword,
            },
        });

        res.status(200).json({ message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
};

module.exports = { register, login, resetPassword };
