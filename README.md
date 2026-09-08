# Marketplace

Полноценный многопользовательский маркетплейс (multi-vendor marketplace) на Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma/PostgreSQL, NextAuth.js и Stripe.

## Стек

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, компоненты в стиле shadcn/ui (Radix UI)
- **Backend**: Next.js API Routes (Route Handlers)
- **База данных**: PostgreSQL + Prisma ORM
- **Аутентификация**: NextAuth.js (email/пароль + Google + GitHub OAuth)
- **Платежи**: Stripe Checkout + webhooks
- **Хранение файлов**: Cloudflare R2 (S3-совместимое, presigned URLs)
- **Почта**: Resend
- **Состояние корзины**: Zustand (persist в localStorage)

## Структура проекта

```
app/                    Страницы и API-роуты (App Router)
  (auth)/               Логин/регистрация
  admin/                Админ-панель (пользователи, магазины, товары, категории)
  seller/               Кабинет продавца (dashboard, товары, заказы, настройки)
  products/             Каталог и страница товара
  cart/, checkout/      Корзина и оформление заказа
  orders/, wishlist/, profile/
  api/                  REST API-роуты
components/             Переиспользуемые React-компоненты
  ui/                   Базовые UI-примитивы (button, input, card, dialog...)
lib/                    Конфигурация: prisma, auth, stripe, storage, email, utils
prisma/                 schema.prisma + seed.ts
types/                  Расширения типов (next-auth.d.ts)
public/                 Статические файлы
```

## Роли пользователей

- **BUYER** — покупатель: каталог, корзина, заказы, избранное, отзывы
- **SELLER** — продавец: магазин, CRUD товаров, статистика, управление заказами
- **ADMIN** — администратор: модерация магазинов/товаров, управление пользователями, категориями, статистика платформы

## Запуск проекта

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

Скопируйте `.env.example` в `.env` и заполните переменные:

```bash
cp .env.example .env
```

- `DATABASE_URL` — строка подключения к PostgreSQL
- `NEXTAUTH_SECRET` — сгенерировать: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET` — OAuth-приложения
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — из Stripe Dashboard
- `R2_*` — Cloudflare R2 bucket (или замените `lib/storage.ts` на AWS S3, интерфейс идентичен)
- `RESEND_API_KEY`, `EMAIL_FROM` — для транзакционных писем

### 3. База данных

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Тестовые аккаунты после seed (пароль для всех: `password123`):
- `admin@marketplace.dev` — администратор
- `seller@marketplace.dev` — продавец (магазин "TechHub Store" уже одобрен)
- `buyer@marketplace.dev` — покупатель

### 4. Локальный запуск

```bash
npm run dev
```

Приложение будет доступно на http://localhost:3000

### 5. Stripe webhook (локально)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Скопируйте выведенный `whsec_...` в `STRIPE_WEBHOOK_SECRET`.

## Деплой

### Vercel

1. Импортируйте репозиторий в Vercel
2. Добавьте переменные окружения из `.env.example`
3. В настройках Build Command оставьте `prisma generate && next build` (уже прописано в `package.json`)
4. Подключите managed PostgreSQL (Vercel Postgres, Neon, Supabase) и пропишите `DATABASE_URL`
5. Добавьте Stripe webhook endpoint `https://<домен>/api/webhooks/stripe` в Stripe Dashboard

### Docker + VPS

Пример `Dockerfile` (добавьте при необходимости):

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Запустите PostgreSQL рядом (docker-compose) и пропишите переменные окружения в контейнер.

## Основной функционал

- Регистрация/вход (email+пароль, Google, GitHub), роли BUYER/SELLER/ADMIN
- Продавцы: создание магазина (модерация админом), CRUD товаров (с модерацией), загрузка изображений, статистика (доход, просмотры, заказы), управление статусами заказов, настройка способов доставки
- Покупатели: поиск/фильтры (цена, категория, сортировка), корзина, избранное, оформление заказа со Stripe Checkout, отслеживание заказов, отзывы и рейтинги (только после покупки)
- Админ: управление пользователями и ролями, модерация магазинов и товаров, управление категориями, общая статистика платформы
- Уведомления в БД + email-уведомления о смене статуса заказа
- SEO: динамические метатеги, `sitemap.xml`, `robots.txt`
- Адаптивный дизайн (mobile-first), доступность (контраст, фокус, aria-label)

## Известные упрощения (для продакшена доработать)

- Оплата разбивается на несколько `Order` по магазинам в рамках одной Stripe Checkout Session (метаданные `orderIds`); частичные возвраты и раздельные выплаты продавцам (Stripe Connect) не реализованы — для реального маркетплейса используйте [Stripe Connect](https://stripe.com/docs/connect)
- `public/placeholder.svg` используется как заглушка изображений — замените на брендированную заглушку
- Rate-limiting и капча на формах регистрации/отзывов не добавлены
- i18n (мультиязычность) не подключена, но структура текста вынесена в компоненты — можно добавить `next-intl`
