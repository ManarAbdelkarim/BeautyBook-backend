FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate


FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app .

COPY .env .env

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/index.js"]
