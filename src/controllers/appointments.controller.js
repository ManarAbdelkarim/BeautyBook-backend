const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit')
const prisma = new PrismaClient();
const path = require('path');
const reshaper = require('arabic-persian-reshaper');
const arabicReshaper = require('arabic-reshaper');
const fs = require('fs');

const arabicReshape = arabicReshaper.convertArabicBack

const getAllAppointments = async (req, res) => {
    const { page = 1, date, time, field, keyword, minPrice, maxPrice, paid, staffId } = req.query
    const take = 20;
    const skip = (page - 1) * take;

    const where = {};

    if (paid) {
        where.paid = paid === "true";
    }
    if (staffId) {
        where.staffId = Number(staffId);
    }
    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        where.date = { gte: startOfDay, lte: endOfDay };
    }
    if (time) {
        where.time = time;
    }
    if (field && keyword && field !== 'price') {
        where[field] = { contains: keyword };
    }
    if (minPrice || maxPrice) {
        where.service = {
            price: {
                gte: minPrice ? parseFloat(minPrice) : undefined,
                lte: maxPrice ? parseFloat(maxPrice) : undefined
            }
        };
    }
    const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
            where,
            skip,
            take,
            include: { service: true, staff: true }
        }),
        prisma.appointment.count({ where })
    ]);

    res.json({
        data: appointments,
        total,
        page: Number(page),
        pages: Math.ceil(total / take)
    });
};

const getAppointmentById = async (req, res) => {
    const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(req.params.id) },
        include: { service: true, staff: true }
    });
    if (!appointment) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'STAFF' && appointment.staffId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(appointment);
};

const createAppointment = async (req, res) => {
    const { clientName, date, time, serviceId, notes, paid } = req.body;

    const appointment = await prisma.appointment.create({
        data: {
            clientName,
            date: new Date(date),
            time,
            notes,
            paid,
            staffId: req.user.id,
            serviceId
        }
    });
    res.status(201).json(appointment);
};

const updateAppointment = async (req, res) => {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({ where: { id: parseInt(id) } });
    if (!appointment) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'STAFF' && appointment.staffId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    data = { ...req.body }
    data.date = new Date(data.date)

    const updated = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: data
    });

    res.json(updated);
};

const deleteAppointment = async (req, res) => {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({ where: { id: parseInt(id) } });
    if (!appointment) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'STAFF' && appointment.staffId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.appointment.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Deleted' });
};

function reverseWords(text) {
    if (!text) return '';
    return text.split(' ').reverse().join(' ');
}

function isArabic(text) {
    return /[\u0600-\u06FF]/.test(text);
}

function shapeArabic(text) {
    try {

        const reshaped = arabicReshape(text);
        return reverseWords(reshaped);
    } catch (err) {
        console.error('Error in shaping Arabic text:', err);
        return String(text);
    }
}

function processText(text) {
    if (isArabic(text)) {
        return shapeArabic(text);
    }
    return String(text);
}


const exportAppointmentsPDF = async (req, res) => {

    const appointments = await prisma.appointment.findMany({
        include: { service: true, staff: true }
    });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    const fontPath = path.join(__dirname, '../..', 'fonts', 'Cairo-Regular.ttf');
    doc.registerFont('ArabicFont', fontPath);
    doc.font('ArabicFont');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=appointments.pdf');

    doc.pipe(res);
    doc.fontSize(18).text(shapeArabic(' تقرير المواعيد'), { align: 'center' });
    doc.moveDown(2);

    const tableTop = 100;
    const rowHeight = 30;
    const colWidths = [40, 100, 100, 100, 80, 60];
    const headers = ['الوقت', 'التاريخ', 'الموظف', 'الخدمة', shapeArabic('اسم العميل'), '#'];
    let x = doc.page.margins.right;
    let y = tableTop;

    headers.forEach((header, i) => {
        doc
            .fontSize(12)
            .text(header, x, y, { width: colWidths[i], align: 'center' });
        x += colWidths[i];
    });

    doc.moveTo(doc.page.margins.left, y + rowHeight - 10)
        .lineTo(doc.page.width - doc.page.margins.right, y + rowHeight - 10)
        .stroke();

    y += rowHeight;

    appointments.forEach((appt, i) => {
        const row = [
            processText(appt.time ?? 'غير محدد'),
            new Date(appt.date).toLocaleDateString('ar-EG'),
            processText(appt.staff?.name ?? 'بدون موظف'),
            processText(appt.service?.name ?? 'بدون خدمة'),
            processText(appt.clientName ?? 'غير معروف'),
            i + 1
        ];

        x = doc.page.margins.left;

        row.forEach((text, j) => {
            doc
                .fontSize(10)
                .text(text, x, y, {
                    width: colWidths[j],
                    align: 'right',
                    ellipsis: true
                });
            x += colWidths[j];
        });

        y += rowHeight;
        if (y > doc.page.height - doc.page.margins.bottom - rowHeight) {
            doc.addPage();
            y = tableTop;
        }
    });

    doc.end();
};

const exportAppointmentByIdPDF = async (req, res) => {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
        where: { id: Number(id) },
        include: { service: true, staff: true }
    });

    if (!appointment) {
        return res.status(404).send('Appointment not found');
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    const fontPath = path.join(__dirname, '../..', 'fonts', 'Cairo-Regular.ttf');
    if (!fs.existsSync(fontPath)) {
        return res.status(500).send('Font file not found');
    }

    doc.registerFont('ArabicFont', fontPath);
    doc.font('ArabicFont');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=appointment.pdf');

    doc.pipe(res);

    doc.fontSize(20).fillColor('black').text(processText('تفاصيل الموعد'), {
        align: 'center'
    });

    doc.moveDown(2);

    const fields = [
        { label: 'اسم العميل', value: appointment.clientName ?? 'غير معروف' },
        { label: 'الخدمة', value: appointment.service?.name ?? 'بدون خدمة' },
        { label: 'السعر', value: appointment.service?.price ? +  appointment.service?.price + " JD" : 'بدون خدمة' },
        { label: 'الموظف', value: appointment.staff?.name ?? 'بدون موظف' },
        { label: 'التاريخ', value: new Date(appointment.date).toLocaleDateString('ar-EG') },
        { label: 'الوقت', value: appointment.time ?? 'غير محدد' }
    ];

    const totalWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const labelWidth = 150;
    const valueWidth = totalWidth - labelWidth - 20;
    const rowHeight = 30;
    let y = doc.y;

    fields.forEach(field => {
        const labelText = processText(field.label);
        const valueText = processText(field.value);

        doc.rect(doc.page.margins.left, y, totalWidth, rowHeight)
            .fillOpacity(0.05)
            .fillAndStroke('#e0e0e0', '#e0e0e0');

        doc.fillOpacity(1).fillColor('black').fontSize(14);

        doc.text(valueText, doc.page.margins.left + 10, y + 8, {
            width: valueWidth,
            align: 'left'
        });

        doc.text(labelText, doc.page.margins.left + valueWidth + 20, y + 8, {
            width: labelWidth,
            align: 'right'
        });

        y += rowHeight + 5;
    });

    doc.end();
};

module.exports = {
    getAllAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    exportAppointmentsPDF,
    exportAppointmentByIdPDF
};
