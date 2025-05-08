FROM node:22.14.0

# Uygulama dizini
WORKDIR /app

# package.json ve package-lock.json kopyala ve yükle
COPY package*.json ./
RUN npm install

# Geri kalan dosyaları (app.js, routes, models, vs.) kopyala
COPY . .

# Uygulama portu
EXPOSE 3000

# Uygulama başlat
CMD ["npm","run","start"]
