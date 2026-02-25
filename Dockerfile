# --- STAGE 1: Build Assets (Node.js + PHP 8.3) ---
FROM node:20-alpine AS assets-builder
WORKDIR /app

# Menggunakan php83 dan menambahkan repository community agar pasti ketemu
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
    php83-curl

# Buat symlink ke php83 (penting!)
RUN ln -s /usr/bin/php83 /usr/bin/php

COPY package*.json ./
RUN npm install

COPY . .

# Siapkan .env sementara untuk Wayfinder
RUN cp .env.example .env

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