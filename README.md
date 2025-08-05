# BeautyBook - Backend

This is the backend API for the BeautyBook platform. It handles authentication, appointments, services, staff, and more.

## 🛠 Tech Stack

- Node.js
- Express
- Prisma ORM
- MySQL
- Docker
- JWT Authentication
- Nodemailer (for emails)

---

## 📁 Project Structure

    src/
    ├── controllers/
    ├── routes/
    ├── middlewares/
    ├── prisma/
    ├── utils/
    └── server.js

---

## ⚙️ Environment Variables

Create a `.env` file in the root with:

PORT=5000
DATABASE_URL="mysql://manar:434200161@db:3306/beautybook"
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
HOST_PORT=http://localhost:3000


---

## 🐳 Run with Docker


## Prerequisites

- Docker installed on your machine
- Docker Compose installed

---


### 1. Build and start the containers

From the root directory (where `docker-compose.yml` is located), run:

```bash
docker-compose up --build
```
for the first time add an admin :
docker exec -it beautybook-backend sh
npx prisma db push
npx prisma db seed
exit

## 🔄 Database
Run migration and seed:
        npx prisma migrate dev --name init
        npx prisma db seed
## 📬 API Base URL
    http://localhost:5000/api

## ✅ Features
 - User authentication (JWT)

 - Appointments management

 - Staff & services CRUD

 - Soft delete & restore

 - Email notifications

## 🔐 Admin Seeding
An admin user is seeded automatically if database is empty.

Email: admin@beautybook.com
Password: admin123 (change it in seed script!)

