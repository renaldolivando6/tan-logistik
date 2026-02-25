# --- STAGE 1: Build Assets (Node.js + PHP 8.3 untuk Wayfinder) ---
FROM node:20-alpine AS assets-builder
WORKDIR /app

# Menggunakan php83 karena ini versi standar di Alpine terbaru
# Menambahkan repositori 'community' agar paket pasti ditemukan
RUN apk add --no-cache \
    php83 \
    php83-phar \
    php83-iconv \
    php83-mbstring \
    php83-openssl \
    php83-tokenizer \
    php83-xml \
    php83-ctype \
    php83-dom \
    php83-curl \
    php83-session

# Buat symlink agar perintah 'php' mengarah ke php83
RUN ln -s /usr/bin/php83 /usr/bin/php

# Copy package files dan install dependencies Node
COPY package*.json ./
RUN npm install

# Copy seluruh project
COPY . .

# Wayfinder butuh membaca config, kita siapkan .env sementara
RUN cp .env.example .env

# Jalankan build assets (Vite)
RUN npm run build

# --- STAGE 2: PHP Application (Production Image menggunakan PHP 8.2) ---
FROM php:8.2-fpm-alpine
WORKDIR /var/www/html

# Install system dependencies untuk PHP Extensions di Alpine
RUN apk add --no-cache \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    icu-dev \
    oniguruma-dev

# Install PHP extensions wajib untuk Laravel 12
RUN docker-php-ext-install pdo_mysql bcmath gd zip intl mbstring

# Ambil Composer terbaru
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy seluruh file project
COPY . .

# AMBIL HASIL BUILD: Copy folder public/build dari STAGE 1
COPY --from=assets-builder /app/public/build ./public/build

# Install dependencies PHP (Production mode)
RUN composer install --no-dev --optimize-autoloader

# Atur hak akses folder storage dan cache
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]