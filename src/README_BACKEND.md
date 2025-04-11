
# Backend API Implementation Guide

## Overview

This frontend application has been configured to work with a PostgreSQL database through a REST API.
You will need to implement a backend API server that provides the endpoints defined in `src/services/api.ts`.

## Requirements

1. Create a REST API server running on http://localhost:5000
2. Implement all endpoints used in the API services
3. Connect to PostgreSQL using the configuration from src/config.ts
4. Ensure proper authentication and authorization

## API Endpoints to Implement

### Authentication
- POST /api/auth/login
- POST /api/auth/register

### Medicines
- GET /api/medicines
- GET /api/medicines/status/:status
- GET /api/medicines/:id
- POST /api/medicines
- PUT /api/medicines/:id
- DELETE /api/medicines/:id
- GET /api/medicines/summary
- POST /api/medicines/import

### Notifications
- POST /api/notifications
- GET /api/notifications
- GET /api/notifications/medicine/:medicineId
- PUT /api/notifications/:id/sent
- PUT /api/notifications/:id/failed
- POST /api/notifications/process
- POST /api/notifications/schedule

### Notification Recipients
- GET /api/notifications/recipients
- POST /api/notifications/recipients
- PUT /api/notifications/recipients/:id
- DELETE /api/notifications/recipients/:id

### Inventory
- PUT /api/inventory/medicines/:medicineId/stock
- GET /api/inventory/report
- POST /api/inventory/log

## Implementation Recommendations

You can implement the backend using any technology stack that supports REST APIs and PostgreSQL:

1. Node.js with Express and pg (node-postgres)
2. Python with Flask/Django and psycopg2
3. Java with Spring Boot and JDBC
4. PHP with Laravel and PDO
5. C# with ASP.NET Core and Npgsql

## Authentication

The frontend expects a JWT-based authentication system:

1. The login/register endpoints should return a token
2. Subsequent requests will include this token in the Authorization header

## Database Schema

The database schema is defined in scripts/database-setup.sql
