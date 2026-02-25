# --- STAGE 1: Build Assets (Node.js + Minimal PHP for Wayfinder) ---
FROM node:20-alpine AS assets-builder
WORKDIR /app

# Install PHP minimal & dependencies yang dibutuhkan Alpine agar Wayfinder bisa jalan
RUN apk add --no-cache \
    php82 \
    php82-phar \
    php82-iconv \
    php82-mbstring \
    php82-openssl \
    php82-tokenizer \
    php82-xml \
    php82-ctype

# Buat symlink agar perintah 'php' bisa dikenali oleh plugin Vite/Wayfinder
RUN ln -s /usr/bin/php82 /usr/bin/php

# Copy package files dan install dependencies Node
COPY package*.json ./
RUN npm install

# Copy seluruh project (butuh file php artisan dkk untuk build step)
COPY . .

# Wayfinder seringkali butuh membaca config, kita siapkan .env sementara
RUN cp .env.example .env

# Jalankan build assets (Vite)
RUN npm run build

# --- STAGE 2: PHP Application (Production Image) ---
FROM php:8.2-fpm-alpine
WORKDIR /var/www/html

# Install system dependencies untuk PHP Extensions
RUN apk add --no-cache \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    icu-dev \
    oniguruma-dev

# Install PHP extensions yang wajib untuk Laravel 12
RUN docker-php-ext-install pdo_mysql bcmath gd zip intl mbstring

# Ambil Composer terbaru dari image resmi
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy seluruh file project dari host ke container
COPY . .

# AMBIL HASIL BUILD: Copy folder public/build dari STAGE 1 ke sini
COPY --from=assets-builder /app/public/build ./public/build

# Install dependencies PHP (Production mode)
RUN composer install --no-dev --optimize-autoloader

# Atur hak akses folder storage agar Laravel bisa menulis log & cache
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]