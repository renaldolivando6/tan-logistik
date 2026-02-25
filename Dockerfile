# --- STAGE 1: Build Assets (Node.js) ---
FROM node:20-alpine AS assets-builder
WORKDIR /app
COPY package*.json ./
# Menggunakan npm install untuk mengunduh dependencies React/Vite
RUN npm install
COPY . .
# Menjalankan Vite build sesuai script di package.json Anda
RUN npm run build

# --- STAGE 2: PHP Application ---
FROM php:8.2-fpm-alpine
WORKDIR /var/www/html

# Install system dependencies & PHP extensions yang umum dibutuhkan Laravel
RUN apk add --no-cache \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    icu-dev

RUN docker-php-ext-install pdo_mysql bcmath gd zip intl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy semua file project
COPY . .

# Copy hasil build dari Stage 1 (folder public/build)
COPY --from=assets-builder /app/public/build ./public/build

# Install dependencies PHP (tanpa dev-dependencies untuk efisiensi)
RUN composer install --no-dev --optimize-autoloader

# Set permissions untuk folder storage
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]