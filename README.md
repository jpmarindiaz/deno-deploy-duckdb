# Deno Deploy DuckDB App

A simple and powerful API built with Deno that demonstrates DuckDB-style functionality and can be deployed to Deno Deploy. This app shows how to create a REST API with a DuckDB-style data structure.

## Features

- 🦆 **DuckDB-style API** - Demonstrates the structure you'd have with actual DuckDB
- 🚀 **Deno Deploy Ready** - Optimized for serverless deployment
- 📊 **REST API** - Complete CRUD operations for users and products
- 🔄 **In-memory Data Store** - Perfect for demonstration and Deno Deploy's stateless environment
- 🛡️ **Error Handling** - Comprehensive error handling and validation
- 🌐 **CORS Support** - Ready for frontend integration

## Quick Start

### 1. Install Deno (if you haven't already)

```bash
# Mac/Linux
curl -fsSL https://deno.land/install.sh | sh

# Windows
iwr https://deno.land/install.ps1 -useb | iex
```

### 2. Clone and Run

```bash
# Clone this repository
git clone <your-repo-url>
cd deno-deploy-duckdb

# Run locally
deno task dev
```

### 3. Test the API

The server runs on `http://localhost:8000` by default.

```bash
# Get API documentation
curl http://localhost:8000/

# Get all users
curl http://localhost:8000/users

# Create a new user
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Get a specific user
curl http://localhost:8000/users/1

# Get all products
curl http://localhost:8000/products

# Create a new product
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Smartphone", "price": 699.99, "category": "Electronics"}'

# Get products by category
curl http://localhost:8000/products/category/Electronics
```

## API Endpoints

### General
- `GET /` - API documentation
- `GET /health` - Health check
- `GET /stats` - Database statistics

### Users
- `GET /users` - Get all users
- `POST /users` - Create a user
- `GET /users/:id` - Get user by ID

### Products
- `GET /products` - Get all products
- `POST /products` - Create a product
- `GET /products/category/:category` - Get products by category

## Deploy to Deno Deploy

### Option 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [Deno Deploy](https://dash.deno.com/)
3. Click "New Project"
4. Connect your GitHub repository
5. Set the entry point to `main.ts`
6. Deploy!

### Option 2: Command Line

```bash
# Install deployctl
deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts

# Deploy
deployctl deploy --project=your-project-name main.ts
```

## Project Structure

```
├── main.ts          # Main application entry point
├── deno.json        # Deno configuration and tasks
├── README.md        # This file
├── DEPLOY.md        # Deployment guide
└── .gitignore       # Git ignore rules
```

## Data Structure

The app demonstrates two main data types that would typically be stored in DuckDB tables:

### Users
```typescript
{
  id: number;
  name: string;
  email: string;
  created_at: string;
}
```

### Products
```typescript
{
  id: number;
  name: string;
  price: number;
  category: string;
  created_at: string;
}
```

## About This Implementation

This implementation uses an **in-memory data store** to demonstrate the API structure that would typically use DuckDB. Here's why:

1. **Demonstration Purpose**: Shows the complete API structure you'd have with DuckDB
2. **Deno Deploy Compatible**: Works perfectly in Deno Deploy's serverless environment
3. **Production Ready**: The API structure is production-ready and can be easily adapted for real DuckDB usage

## For Production DuckDB Usage

To use actual DuckDB in production, you would:

1. **Local Development**: Replace the in-memory functions with actual DuckDB operations
2. **Alternative Hosting**: Consider services like [MotherDuck](https://motherduck.com/) for cloud DuckDB
3. **Self-hosted**: Deploy to a VPS or container where you have full control over the environment

## Environment Variables

No environment variables are required for this implementation. Everything works out of the box.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `deno task dev`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Learn More

- [Deno Deploy Documentation](https://deno.com/deploy/docs)
- [DuckDB Documentation](https://duckdb.org/docs/)
- [Deno Manual](https://deno.land/manual)

---

**🦆 Happy coding with DuckDB and Deno Deploy!** # deno-deploy-duckdb
