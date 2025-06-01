# DuckDB Deno Deploy API

A simple REST API demonstrating DuckDB integration with Deno Deploy.

## Quick Start

```bash
# 1. Initialize database with sample data
deno task init

# 2. Start the API server
deno task dev
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - API documentation
- `GET /health` - Health check
- `GET /users` - List all users
- `POST /users` - Create user `{"name": "...", "email": "..."}`
- `GET /users/:id` - Get user by ID
- `GET /products` - List all products
- `POST /products` - Create product `{"name": "...", "price": 99.99, "category": "..."}`
- `GET /products/category/:category` - Filter products by category
- `GET /stats` - Database analytics

## Features

- **Real DuckDB integration** with persistent file storage
- **Analytics queries** showcasing DuckDB's analytical capabilities
- **Proper BigInt/Decimal handling** for JSON serialization
- **Clean separation** between initialization and API logic

## Project Structure

```
├── main.ts              # API server
├── scripts/init_db.ts   # Database initialization
├── deno.json           # Tasks and dependencies
└── database.duckdb     # DuckDB database file (created by init)
```

## Requirements

- Deno 2.0+
- FFI permissions for DuckDB native bindings
