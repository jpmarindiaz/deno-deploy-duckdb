# DuckDB Basics in Deno

A complete guide to using DuckDB directly in Deno without any wrapper packages.

## Understanding DuckDB Imports

### The npm: Import Syntax

In Deno, you can import npm packages directly using the `npm:` specifier:

```typescript
import { DuckDBInstance } from "npm:@duckdb/node-api";
```

This tells Deno to:
1. Download the `@duckdb/node-api` package from npm
2. Make it available for import
3. Handle all the Node.js compatibility automatically

### Alternative Import Methods

```typescript
// Method 1: Direct npm import (recommended)
import { DuckDBInstance } from "npm:@duckdb/node-api";

// Method 2: With version pinning
import { DuckDBInstance } from "npm:@duckdb/node-api@1.1.0";

// Method 3: Via deno.json imports (for reusability)
// In deno.json:
{
  "imports": {
    "duckdb": "npm:@duckdb/node-api"
  }
}

// Then in your code:
import { DuckDBInstance } from "duckdb";
```

## Core DuckDB Concepts

### 1. Instance vs Connection

```typescript
// Instance: Represents a DuckDB database file or memory database
const instance = await DuckDBInstance.create(); // In-memory
const fileInstance = await DuckDBInstance.create("./mydata.duckdb"); // File-based

// Connection: A session to execute queries against the instance
const connection = await instance.connect();
```

### 2. Running Queries

DuckDB has one main method for executing SQL:

```typescript
// runAndReadAll() - executes SQL and returns results
const result = await connection.runAndReadAll("SELECT * FROM users");

// With parameters (prevents SQL injection)
const result = await connection.runAndReadAll(
  "SELECT * FROM users WHERE age > ?", 
  [18]
);
```

### 3. Reading Results

```typescript
const result = await connection.runAndReadAll("SELECT id, name FROM users");

// Get column names
const columns = result.columnNames(); // ["id", "name"]

// Get rows (array of arrays)
const rows = result.getRows(); // [[1, "Alice"], [2, "Bob"]]

// Convert to objects
const users = rows.map(row => {
  const user: Record<string, unknown> = {};
  columns.forEach((col, i) => {
    user[col] = row[i];
  });
  return user;
});
// Result: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]
```

## Complete Minimal Example

Create a file called `simple.ts`:

```typescript
import { DuckDBInstance } from "npm:@duckdb/node-api";

// Create database and connection
const db = await DuckDBInstance.create(); // In-memory
const conn = await db.connect();

// Create table
await conn.runAndReadAll(`
  CREATE TABLE people (
    id INTEGER,
    name VARCHAR,
    age INTEGER
  )
`);

// Insert data
await conn.runAndReadAll(`
  INSERT INTO people VALUES 
    (1, 'Alice', 30),
    (2, 'Bob', 25)
`);

// Query data
const result = await conn.runAndReadAll("SELECT * FROM people");
console.log("Columns:", result.columnNames());
console.log("Rows:", result.getRows());

// Clean up
conn.disconnectSync();
```

Run it with:
```bash
deno run --allow-all simple.ts
```

## Building a Simple API

Here's a minimal HTTP server with DuckDB:

```typescript
// minimal-api.ts
import { DuckDBInstance } from "npm:@duckdb/node-api";

// Setup database
const db = await DuckDBInstance.create("./api.duckdb");
const conn = await db.connect();

// Initialize tables
await conn.runAndReadAll(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY,
    task VARCHAR NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// HTTP handler
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  if (url.pathname === "/todos" && req.method === "GET") {
    // Get all todos
    const result = await conn.runAndReadAll("SELECT * FROM todos");
    const todos = result.getRows().map(row => ({
      id: row[0],
      task: row[1],
      completed: row[2],
      created_at: row[3]
    }));
    
    return new Response(JSON.stringify(todos), {
      headers: { "Content-Type": "application/json" }
    });
  }
  
  if (url.pathname === "/todos" && req.method === "POST") {
    // Create new todo
    const { task } = await req.json();
    
    await conn.runAndReadAll(
      "INSERT INTO todos (task) VALUES (?)",
      [task]
    );
    
    return new Response(JSON.stringify({ message: "Todo created" }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  return new Response("Not Found", { status: 404 });
}

// Start server
console.log("🦆 Server running on http://localhost:8000");
Deno.serve({ port: 8000 }, handler);
```

Test it:
```bash
# Run the server
deno run --allow-all minimal-api.ts

# Create a todo
curl -X POST http://localhost:8000/todos \
  -H "Content-Type: application/json" \
  -d '{"task": "Learn DuckDB"}'

# Get all todos
curl http://localhost:8000/todos
```

## Common Patterns

### 1. Database Initialization

```typescript
async function initDB() {
  const db = await DuckDBInstance.create("./app.duckdb");
  const conn = await db.connect();
  
  // Create tables
  await conn.runAndReadAll(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email VARCHAR UNIQUE,
      name VARCHAR
    )
  `);
  
  return { db, conn };
}
```

### 2. Safe Parameter Queries

```typescript
// ✅ Good - using parameters
await conn.runAndReadAll(
  "SELECT * FROM users WHERE email = ?",
  [email]
);

// ❌ Bad - SQL injection risk
await conn.runAndReadAll(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

### 3. Error Handling

```typescript
try {
  const result = await conn.runAndReadAll("SELECT * FROM users");
  return result.getRows();
} catch (error) {
  console.error("Database error:", error);
  throw new Error("Failed to fetch users");
}
```

### 4. Connection Cleanup

```typescript
// Always clean up connections
function cleanup() {
  if (conn) {
    conn.disconnectSync();
  }
}

// Handle process termination
Deno.addSignalListener("SIGINT", cleanup);
Deno.addSignalListener("SIGTERM", cleanup);
```

## DuckDB's Superpowers

### 1. Analytics Queries

```typescript
// Complex analytics in a single query
const analytics = await conn.runAndReadAll(`
  SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as user_count,
    COUNT(*) FILTER (WHERE email LIKE '%@gmail.com') as gmail_users,
    AVG(age) as avg_age
  FROM users 
  WHERE created_at >= '2024-01-01'
  GROUP BY month
  ORDER BY month
`);
```

### 2. JSON Processing

```typescript
// Create table with JSON
await conn.runAndReadAll(`
  CREATE TABLE events (
    id INTEGER,
    data JSON
  )
`);

// Insert JSON
await conn.runAndReadAll(
  "INSERT INTO events VALUES (1, ?)",
  [JSON.stringify({ user: "alice", action: "login", timestamp: new Date() })]
);

// Query JSON fields
const result = await conn.runAndReadAll(`
  SELECT 
    data->'$.user' as user,
    data->'$.action' as action
  FROM events
`);
```

### 3. Array Operations

```typescript
// Create table with arrays
await conn.runAndReadAll(`
  CREATE TABLE products (
    id INTEGER,
    name VARCHAR,
    tags VARCHAR[]
  )
`);

// Insert arrays
await conn.runAndReadAll(
  "INSERT INTO products VALUES (1, 'Laptop', ?)",
  [['electronics', 'computer', 'portable']]
);

// Query arrays
const result = await conn.runAndReadAll(`
  SELECT name 
  FROM products 
  WHERE 'electronics' = ANY(tags)
`);
```

## File Formats DuckDB Supports

DuckDB can directly read many file formats:

```typescript
// Read CSV
await conn.runAndReadAll(`
  CREATE TABLE sales AS 
  SELECT * FROM read_csv_auto('sales.csv')
`);

// Read JSON files
await conn.runAndReadAll(`
  CREATE TABLE logs AS 
  SELECT * FROM read_json_auto('logs.json')
`);

// Read Parquet
await conn.runAndReadAll(`
  CREATE TABLE warehouse AS 
  SELECT * FROM read_parquet('data.parquet')
`);
```

## Performance Tips

1. **Use transactions for bulk inserts**:
```typescript
await conn.runAndReadAll("BEGIN TRANSACTION");
for (const user of users) {
  await conn.runAndReadAll("INSERT INTO users VALUES (?, ?)", [user.id, user.name]);
}
await conn.runAndReadAll("COMMIT");
```

2. **Use COPY for large datasets**:
```typescript
await conn.runAndReadAll(`
  COPY users FROM 'users.csv' (FORMAT CSV, HEADER)
`);
```

3. **Create indexes for performance**:
```typescript
await conn.runAndReadAll("CREATE INDEX idx_user_email ON users(email)");
```

## Key Differences from Other Databases

- **Columnar storage**: Optimized for analytics
- **Vectorized processing**: Very fast aggregations
- **File format support**: Can query CSV, JSON, Parquet directly
- **OLAP focused**: Better for data analysis than high-concurrency OLTP
- **Embedded**: Runs in your process, no separate server needed

## When to Use DuckDB

✅ **Great for**:
- Data analysis and reporting
- ETL processing
- Local development databases
- Analytics dashboards
- Data science notebooks
- Small to medium applications

❌ **Not ideal for**:
- High-concurrency web applications
- Real-time transaction processing
- Multi-user concurrent writes
- Distributed systems

