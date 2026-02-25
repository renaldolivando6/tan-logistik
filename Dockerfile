# ============================================
# Stage 1: The Builder (PHP + Node + Composer)
# ============================================
FROM php:8.2-fpm-alpine AS builder
WORKDIR /app

# 1. Install Node.js, NPM, dan kebutuhan OS
RUN apk add --no-cache nodejs npm zip unzip libpng-dev libzip-dev icu-dev oniguruma-dev

# 2. Install Ekstensi PHP wajib
RUN docker-php-ext-install pdo_mysql bcmath gd zip intl mbstring

# 3. Siapkan Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Copy file manifest
COPY composer.json composer.lock* ./
COPY package*.json ./

# 5. KUNCI UTAMA: Install vendor PHP DULU untuk Wayfinder
RUN composer install --no-dev --no-scripts --prefer-dist

# 6. Install Node Modules
RUN npm ci

# 7. Copy seluruh project
COPY . .

# 8. Pancing Wayfinder & Jalankan Build
RUN cp .env.example .env \
    && composer dump-autoload --optimize \
    && npm run build

# ============================================
# Stage 2: Production image (Nginx + PHP-FPM via Supervisor)
# ============================================
FROM php:8.2-fpm-alpine

# Gunakan script ajaib mlocati (sama seperti Tebu)
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions pdo_mysql mysqli zip gd intl imap bcmath exif mbstring xml curl opcache pcntl redis

# Install nginx & supervisor
RUN apk add --no-cache nginx supervisor

# Membuat folder log Supervisor & Nginx
RUN mkdir -p /var/log/supervisor /var/log/nginx /var/cache/nginx \
    && chown -R www-data:www-data /var/log/supervisor /var/log/nginx /var/cache/nginx

# PHP production config
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# --- COPY KONFIGURASI ---
# Pastikan folder docker/ di repo Trans Nusa isinya sama dengan Tebu
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

WORKDIR /var/www/html

# --- AMBIL HASIL MATANG DARI STAGE 1 ---
COPY --from=builder /app ./

# Set permissions untuk Laravel
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Bersihkan sisa-sisa build
RUN rm -rf node_modules tests .git docker

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]