# ── ETAPA 1: Construcción ──────────────────────────────────────────────────────
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Sustituir el servidor remoto del profesor por localhost para despliegue local
RUN sed -i "s|http://147.96.71.236|http://localhost|g" src/main.js
RUN npm run build

# ── ETAPA 2: Servir con nginx ──────────────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html/vr-isa
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
