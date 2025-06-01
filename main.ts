// Deno Deploy DuckDB API
// Simple CRUD operations with DuckDB

import { DuckDBInstance } from "@duckdb/node-api";

// Global DuckDB instance and connection
let dbInstance: any = null;
let dbConnection: any = null;

// Helper function to convert BigInt to number for JSON serialization
function convertBigIntValues(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  // Handle DuckDB decimal objects
  if (obj && typeof obj === 'object' && 'value' in obj && 'scale' in obj) {
    const value = typeof obj.value === 'bigint' ? Number(obj.value) : obj.value;
    return value / Math.pow(10, obj.scale);
  }
  
  // Handle DuckDB timestamp objects
  if (obj && typeof obj === 'object' && 'micros' in obj) {
    const micros = typeof obj.micros === 'bigint' ? Number(obj.micros) : obj.micros;
    return new Date(micros / 1000).toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntValues);
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntValues(obj[key]);
    }
    return converted;
  }
  
  return obj;
}

// Connect to existing DuckDB database
async function getConnection() {
  if (dbConnection) return dbConnection;
  
  try {
    console.log("🦆 Connecting to DuckDB database...");
    
    // Connect to persistent database file (created by init script)
    // For Deno Deploy, this would be in-memory, but for local dev it's persistent
    const dbPath = "./database.duckdb";
    dbInstance = await DuckDBInstance.create(dbPath);
    dbConnection = await dbInstance.connect();
    
    console.log("✅ Connected to DuckDB database");
    return dbConnection;
  } catch (error) {
    console.error("❌ Error connecting to DuckDB:", error);
    throw error;
  }
}

// Database operations for users
async function createUser(name: string, email: string) {
  const connection = await getConnection();
  
  try {
    // Get next ID
    const maxIdResult = await connection.runAndReadAll("SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM users");
    const nextId = Number(convertBigIntValues(maxIdResult.getRows()[0][0]));
    
    await connection.runAndReadAll(
      "INSERT INTO users (id, name, email) VALUES (?, ?, ?)",
      [nextId, name, email]
    );
    console.log(`✅ User created: ${name} (${email})`);
    
    // Return the created user
    const result = await connection.runAndReadAll(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const rows = result.getRows();
    const columns = result.columnNames();
    
    if (rows.length > 0) {
      const user: Record<string, any> = {};
      columns.forEach((col: string, i: number) => {
        user[col] = convertBigIntValues(rows[0][i]);
      });
      return user;
    }
    return null;
  } catch (error) {
    console.error("❌ Error creating user:", error);
    throw error;
  }
}

async function getAllUsers() {
  const connection = await getConnection();
  
  try {
    const result = await connection.runAndReadAll(
      "SELECT * FROM users ORDER BY created_at DESC"
    );
    const rows = result.getRows();
    const columns = result.columnNames();
    
    return rows.map((row: any[]) => {
      const user: Record<string, any> = {};
      columns.forEach((col: string, i: number) => {
        user[col] = convertBigIntValues(row[i]);
      });
      return user;
    });
  } catch (error) {
    console.error("❌ Error getting users:", error);
    throw error;
  }
}

async function getUserById(id: number) {
  const connection = await getConnection();
  
  try {
    const result = await connection.runAndReadAll(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    const rows = result.getRows();
    const columns = result.columnNames();
    
    if (rows.length > 0) {
      const user: Record<string, any> = {};
      columns.forEach((col: string, i: number) => {
        user[col] = convertBigIntValues(rows[0][i]);
      });
      return user;
    }
    return null;
  } catch (error) {
    console.error("❌ Error getting user by ID:", error);
    throw error;
  }
}

// Database operations for products
async function createProduct(name: string, price: number, category: string) {
  const connection = await getConnection();
  
  try {
    // Get next ID
    const maxIdResult = await connection.runAndReadAll("SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM products");
    const nextId = Number(convertBigIntValues(maxIdResult.getRows()[0][0]));
    
    await connection.runAndReadAll(
      "INSERT INTO products (id, name, price, category) VALUES (?, ?, ?, ?)",
      [nextId, name, price, category]
    );
    console.log(`✅ Product created: ${name} ($${price})`);
    
    // Return the created product
    const result = await connection.runAndReadAll(
      "SELECT * FROM products WHERE name = ? AND price = ? AND category = ? ORDER BY id DESC LIMIT 1",
      [name, price, category]
    );
    const rows = result.getRows();
    const columns = result.columnNames();
    
    if (rows.length > 0) {
      const product: Record<string, any> = {};
      columns.forEach((col: string, i: number) => {
        product[col] = convertBigIntValues(rows[0][i]);
      });
      return product;
    }
    return null;
  } catch (error) {
    console.error("❌ Error creating product:", error);
    throw error;
  }
}

async function getAllProducts() {
  const connection = await getConnection();
  
  try {
    const result = await connection.runAndReadAll(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    const rows = result.getRows();
    const columns = result.columnNames();
    
    return rows.map((row: any[]) => {
      const product: Record<string, any> = {};
      columns.forEach((col: string, i: number) => {
        product[col] = convertBigIntValues(row[i]);
      });
      return product;
    });
  } catch (error) {
    console.error("❌ Error getting products:", error);
    throw error;
  }
}

async function getProductsByCategory(category: string) {
  const connection = await getConnection();
  
  try {
    const result = await connection.runAndReadAll(
      "SELECT * FROM products WHERE category = ? ORDER BY price ASC",
      [category]
    );
    const rows = result.getRows();
    const columns = result.columnNames();
    
    return rows.map((row: any[]) => {
      const product: Record<string, any> = {};
      columns.forEach((col: string, i: number) => {
        product[col] = convertBigIntValues(row[i]);
      });
      return product;
    });
  } catch (error) {
    console.error("❌ Error getting products by category:", error);
    throw error;
  }
}

// Get database statistics
async function getDatabaseStats() {
  const connection = await getConnection();
  
  try {
    const userCountResult = await connection.runAndReadAll("SELECT COUNT(*) as count FROM users");
    const productCountResult = await connection.runAndReadAll("SELECT COUNT(*) as count FROM products");
    
    // Get analytics data (DuckDB's strength!)
    const analyticsResult = await connection.runAndReadAll(`
      SELECT 
        category,
        COUNT(*) as product_count,
        AVG(price) as avg_price,
        MAX(price) as max_price,
        MIN(price) as min_price
      FROM products 
      GROUP BY category
      ORDER BY category
    `);
    
    const userCount = userCountResult.getRows()[0][0];
    const productCount = productCountResult.getRows()[0][0];
    
    const analyticsRows = analyticsResult.getRows();
    const analyticsColumns = analyticsResult.columnNames();
    
    const analytics = analyticsRows.map((row: any[]) => {
      const stat: Record<string, any> = {};
      analyticsColumns.forEach((col: string, i: number) => {
        stat[col] = convertBigIntValues(row[i]);
      });
      return stat;
    });
    
    return {
      users: convertBigIntValues(userCount),
      products: convertBigIntValues(productCount),
      analytics
    };
  } catch (error) {
    console.error("❌ Error getting database stats:", error);
    throw error;
  }
}

// HTTP request handler
async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;

  // Helper function for JSON responses
  const json = (data: any, status = 200) => new Response(
    JSON.stringify(convertBigIntValues(data), null, 2), 
    { 
      status, 
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    }
  );

  // Handle CORS preflight requests
  if (method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  try {
    // Home route - API documentation
    if (path === "/" && method === "GET") {
      return json({
        message: "🦆 DuckDB API on Deno Deploy",
        version: "1.0.0",
        database: "DuckDB (persistent file)",
        description: "A clean DuckDB-powered REST API demonstrating analytical capabilities",
        setup: "Run 'deno run scripts/init_db.ts' to initialize database with sample data",
        routes: {
          "GET /": "This documentation",
          "GET /users": "Get all users",
          "POST /users": "Create a user (JSON: {name, email})",
          "GET /users/:id": "Get user by ID",
          "GET /products": "Get all products",
          "POST /products": "Create a product (JSON: {name, price, category})",
          "GET /products/category/:category": "Get products by category",
          "GET /health": "Health check",
          "GET /stats": "Database statistics and analytics"
        },
        examples: {
          create_user: {
            method: "POST",
            url: "/users",
            body: { name: "Alice", email: "alice@example.com" }
          },
          create_product: {
            method: "POST",
            url: "/products",
            body: { name: "Laptop", price: 999.99, category: "Electronics" }
          }
        },
        duckdb_features: [
          "Real SQL database with ACID properties",
          "Advanced analytics and aggregations",
          "JSON support built-in",
          "High-performance columnar storage",
          "Persistent file-based storage"
        ]
      });
    }

    // Health check
    if (path === "/health" && method === "GET") {
      try {
        const stats = await getDatabaseStats();
        return json({ 
          status: "healthy", 
          timestamp: new Date().toISOString(),
          database: "DuckDB connected",
          tables: {
            users: stats.users,
            products: stats.products
          }
        });
      } catch (error) {
        return json({ 
          status: "unhealthy", 
          timestamp: new Date().toISOString(),
          database: "DuckDB error",
          error: error instanceof Error ? error.message : "Unknown error"
        }, 500);
      }
    }

    // Database statistics
    if (path === "/stats" && method === "GET") {
      const stats = await getDatabaseStats();
      return json({
        ...stats,
        timestamp: new Date().toISOString(),
        note: "Analytics powered by DuckDB's columnar engine"
      });
    }

    // User routes
    if (path === "/users" && method === "GET") {
      const users = await getAllUsers();
      return json({ users, count: users.length });
    }

    if (path === "/users" && method === "POST") {
      try {
        const body = await request.json();
        
        if (!body.name || !body.email) {
          return json({ error: "Name and email are required" }, 400);
        }

        const user = await createUser(body.name, body.email);
        return json({ message: "User created successfully!", user }, 201);
        
      } catch (error) {
        if (error instanceof Error && error.message.includes("UNIQUE")) {
          return json({ error: "Email already exists" }, 409);
        }
        return json({ 
          error: "Database error", 
          message: error instanceof Error ? error.message : "Unknown error"
        }, 400);
      }
    }

    if (path.startsWith("/users/") && method === "GET") {
      const id = parseInt(path.split("/")[2]);
      
      if (isNaN(id)) {
        return json({ error: "Invalid user ID" }, 400);
      }

      const user = await getUserById(id);
      
      if (!user) {
        return json({ error: "User not found" }, 404);
      }

      return json({ user });
    }

    // Product routes
    if (path === "/products" && method === "GET") {
      const products = await getAllProducts();
      return json({ products, count: products.length });
    }

    if (path === "/products" && method === "POST") {
      try {
        const body = await request.json();
        
        if (!body.name || !body.price || !body.category) {
          return json({ error: "Name, price, and category are required" }, 400);
        }

        if (typeof body.price !== "number" || body.price <= 0) {
          return json({ error: "Price must be a positive number" }, 400);
        }

        const product = await createProduct(body.name, body.price, body.category);
        return json({ message: "Product created successfully!", product }, 201);
        
      } catch (error) {
        return json({ 
          error: "Database error", 
          message: error instanceof Error ? error.message : "Unknown error"
        }, 400);
      }
    }

    if (path.startsWith("/products/category/") && method === "GET") {
      const category = decodeURIComponent(path.split("/")[3]);
      
      if (!category) {
        return json({ error: "Category is required" }, 400);
      }

      const products = await getProductsByCategory(category);
      return json({ products, category, count: products.length });
    }

    // 404 for unknown routes
    return json({ error: "Route not found", path }, 404);

  } catch (error) {
    console.error("Server error:", error);
    return json({ 
      error: "Internal server error", 
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
}

// Deno Deploy handler
export default {
  async fetch(request: Request): Promise<Response> {
    return handleRequest(request);
  },
}; 