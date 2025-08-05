require('dotenv').config();
const express = require('express');
const appointmentsRoutes = require('./routes/appointments.routes');
const servicesRoutes = require('./routes/services.routes');
const staffRoutes = require('./routes/staff.routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

const authRoutes = require('./routes/auth.routes');
const corsOptions = {
    origin: process.env.HOST_PORT,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/staff', staffRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
