const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const getAll = async (req, res) => {
    const { all } = req.query
    const data = await prisma.service.findMany(!all && {
        where: { isDeleted: false }
    });
    res.json(data);
};

const getOne = async (req, res) => {
    const data = await prisma.service.findFirst({
        where: {
            id: +req.params.id,
            isDeleted: false
        }
    });
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
};

const create = async (req, res) => {
    const { name, price, duration, description } = req.body;
    const created = await prisma.service.create({ data: { name, price, duration, description } });
    res.status(201).json(created);
};

const restore = async (req, res) => {
    const data = await prisma.service.findFirst({
        where: {
            id: +req.body.id,
        }
    });
    data.isDeleted = false
    const updated = await prisma.service.update({
        where: { id: +req.body.id },
        data: { ...data }
    });
    res.json(updated);
};

const update = async (req, res) => {
    const updated = await prisma.service.update({
        where: { id: +req.params.id },
        data: req.body
    });
    res.json(updated);
};


const remove = async (req, res) => {
    const id = +req.params.id;
    await prisma.service.update({
        where: { id },
        data: { isDeleted: true },
    });
    res.json({ message: 'Soft deleted' });
};




module.exports = { getAll, getOne, create, update, remove, restore };
