# --- STAGE 1: The Builder (PHP + Node.js + Composer) ---
FROM php:8.2-fpm-alpine AS builder
WORKDIR /app

# 1. Install Node.js, NPM, dan kebutuhan OS
RUN apk add --no-cache nodejs npm zip unzip libpng-dev libzip-dev icu-dev oniguruma-dev

# 2. Install Ekstensi PHP wajib Laravel
RUN docker-php-ext-install pdo_mysql bcmath gd zip intl mbstring

# 3. Siapkan Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Copy file manifest dependencies
COPY composer.json composer.lock* ./
COPY package*.json ./

# 5. KUNCI UTAMA: Install vendor PHP DULU agar Laravel bisa hidup saat di-build
RUN composer install --no-dev --no-scripts --prefer-dist

# 6. Install Node Modules
RUN npm install

# 7. Copy seluruh kode project
COPY . .

# 8. Pancing Wayfinder dengan .env sementara
RUN cp .env.example .env
RUN composer dump-autoload --optimize

# 9. SEKARANG JALANKAN VITE BUILD (Wayfinder pasti tersenyum melihat vendor sudah ada)
RUN npm run build


# --- STAGE 2: Production Image (Bersih & Ringan) ---
FROM php:8.2-fpm-alpine
WORKDIR /var/www/html

# Install kebutuhan OS untuk Production
RUN apk add --no-cache libpng-dev libzip-dev icu-dev oniguruma-dev

# Install Ekstensi PHP
RUN docker-php-ext-install pdo_mysql bcmath gd zip intl mbstring

# COPY SEMUANYA DARI STAGE 1 (Kode, Vendor, dan Hasil Build React)
COPY --from=builder /app /var/www/html

# Atur izin folder agar Laravel bisa menyimpan log
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]