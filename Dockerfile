FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .       # <<– auch prisma/ und Seed‑Skripte werden übernommen
RUN npx prisma generate      # Prisma Client erzeugen
RUN npm run build

# Serve-Phase
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Logging in stdout/stderr umleiten
RUN sed -i 's@/var/log/nginx/access.log@/dev/stdout@; s@/var/log/nginx/error.log@/dev/stderr@' /etc/nginx/nginx.conf
EXPOSE 80
