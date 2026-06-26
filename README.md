# ECommerceApp

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)

A modular e-commerce backend built with **NestJS**, **TypeScript**, **MongoDB**, and **Mongoose**. The API includes authentication, role-based access control, product and category management, carts, orders, Stripe payments, reviews, wishlists, file uploads, email utilities, and Cloudinary image storage.

## Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Authentication](#authentication)

## Features

- User sign up and sign in with JWT authentication
- Role-based authorization for `admin` and `user`
- Product creation, updates, listing, filtering, and image uploads
- Category creation, updates, deletion, and image uploads
- Cart item creation, quantity updates, and item removal
- Order creation, cancellation, and Stripe payment session support
- Wishlist add, remove, list, and clear operations
- Product review creation, updates, deletion, and listing by product
- MongoDB data models with repository-based data access
- Cloudinary integration for uploaded images
- Email utility powered by Nodemailer
- Query parsing helpers for filtering and pagination-style API features

## Tech Stack

| Area | Tools |
| --- | --- |
| Runtime | Node.js |
| Framework | NestJS 11 |
| Language | TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Validation | class-validator, class-transformer, zod |
| Uploads | Multer, Cloudinary |
| Payments | Stripe |
| Email | Nodemailer |
| Tooling | ESLint, Prettier, Jest |

## Project Structure

The NestJS application is inside the nested project directory:

```text
ECommerceApp-main/
  ECommerceApp-main/
    src/
      common/          Shared decorators, guards, services, utilities, and constants
      core/            Core app module
      DB/              Mongoose models and repositories
      modules/         Feature modules for users, products, cart, orders, reviews, etc.
      app.module.ts    Root NestJS module
      main.ts          Application bootstrap
    test/              End-to-end test setup
    package.json       Scripts and dependencies
```

## Getting Started

### 1. Install dependencies

```bash
cd ECommerceApp-main/ECommerceApp-main
npm install
```

### 2. Create the environment file

The app loads environment variables from `config/.env`.

```bash
mkdir config
```

Create `config/.env` and add the values shown in the next section.

### 3. Start MongoDB

Use a local MongoDB instance or a hosted MongoDB Atlas connection string, then set it as `DB_URL`.

### 4. Run the development server

```bash
npm run start:dev
```

By default, the API listens on:

```text
http://localhost:5000
```

## Environment Variables

Create `ECommerceApp-main/ECommerceApp-main/config/.env`:

```env
PORT=5000
DB_URL=mongodb://127.0.0.1:27017/ecommerce-app

JWT_SECRET=your_jwt_secret
SALT_ROUNDS=10

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL=your_email@example.com
PASSWORD=your_email_app_password

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

## Available Scripts

Run scripts from `ECommerceApp-main/ECommerceApp-main`.

| Command | Description |
| --- | --- |
| `npm run start` | Start the NestJS application |
| `npm run start:dev` | Start the app in watch mode |
| `npm run build` | Build the project |
| `npm run format` | Format source and test files with Prettier |

## API Overview

Base URL:

```text
http://localhost:5000
```

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Health/basic app response |
| `POST` | `/users/signup` | Public | Register a new user |
| `POST` | `/users/signin` | Public | Sign in and receive tokens |
| `GET` | `/users/profile` | Admin | Get authenticated admin profile |
| `POST` | `/category/create` | Admin | Create a category |
| `PATCH` | `/category/update/:id` | Admin | Update a category |
| `DELETE` | `/category/delete/:id` | Admin | Delete a category |
| `POST` | `/product/create` | Admin | Create a product |
| `PATCH` | `/product/update/:productId` | Admin | Update a product |
| `GET` | `/product/list` | Public | List products |
| `POST` | `/cart` | User/Admin | Add item to cart |
| `PUT` | `/cart` | User/Admin | Update cart quantity |
| `DELETE` | `/cart` | User/Admin | Remove item from cart |
| `POST` | `/order/create` | User/Admin | Create an order |
| `POST` | `/order/create-payment` | User/Admin | Create a Stripe payment |
| `POST` | `/order/webhook` | Public | Stripe webhook handler |
| `PUT` | `/order/cancel` | User/Admin | Cancel an order |
| `POST` | `/review` | User/Admin | Create a product review |
| `PUT` | `/review/:id` | User/Admin | Update a review |
| `DELETE` | `/review/:id` | User/Admin | Delete a review |
| `GET` | `/review/product/:productId` | Public | Get reviews for a product |
| `POST` | `/wishlist` | User/Admin | Add product to wishlist |
| `GET` | `/wishlist` | User/Admin | Get wishlist |
| `DELETE` | `/wishlist/:productId` | User/Admin | Remove product from wishlist |
| `DELETE` | `/wishlist` | User/Admin | Clear wishlist |

## Authentication

Protected routes expect a JWT in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

The app supports two roles:

| Role | Description |
| --- | --- |
| `admin` | Can manage products, categories, and protected resources |
| `user` | Can manage cart, wishlist, reviews, and orders |

## Notes

- Image upload endpoints use `multipart/form-data`.
- Product uploads accept `mainImage` and up to five `subImages`.
- Category uploads accept `mainImage`.
- Keep secrets out of source control by storing them only in `config/.env`.

