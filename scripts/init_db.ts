#!/usr/bin/env deno run --allow-ffi --allow-net --allow-read --allow-write --allow-env

// Database initialization script for DuckDB
// This script creates the database file, tables, and inserts sample data

import { DuckDBInstance } from "@duckdb/node-api";

async function initializeDatabase() {
  console.log("🦆 Initializing DuckDB database...");
  
  try {
    // Create persistent database file
    const dbInstance = await DuckDBInstance.create("./database.duckdb");
    const connection = await dbInstance.connect();
    
    console.log("📁 Database file created: ./database.duckdb");
    
    // Create users table
    await connection.runAndReadAll(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name VARCHAR NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Users table created");
    
    // Create products table
    await connection.runAndReadAll(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name VARCHAR NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Products table created");
    
    // Check if data already exists
    const userCountResult = await connection.runAndReadAll("SELECT COUNT(*) as count FROM users");
    const userCount = Number(userCountResult.getRows()[0][0]);
    
    if (userCount === 0) {
      console.log("📝 Adding sample data...");
      
      // Add sample users
      const sampleUsers = [
        [1, "Alice Johnson", "alice@example.com"],
        [2, "Bob Smith", "bob@example.com"],
        [3, "Charlie Brown", "charlie@example.com"],
        [4, "Diana Ross", "diana@example.com"],
        [5, "Edward Norton", "edward@example.com"]
      ];
      
      for (const [id, name, email] of sampleUsers) {
        await connection.runAndReadAll(
          "INSERT INTO users (id, name, email) VALUES (?, ?, ?)",
          [id, name, email]
        );
        console.log(`  👤 Added user: ${name}`);
      }
      
      // Add sample products
      const sampleProducts = [
        [1, "MacBook Pro", 2499.99, "Electronics"],
        [2, "Coffee Mug", 15.99, "Kitchen"],
        [3, "Running Shoes", 129.99, "Sports"],
        [4, "Wireless Mouse", 29.99, "Electronics"],
        [5, "Desk Lamp", 49.99, "Office"],
        [6, "Water Bottle", 19.99, "Sports"],
        [7, "Bluetooth Speaker", 89.99, "Electronics"],
        [8, "Cooking Pan", 39.99, "Kitchen"],
        [9, "Notebook", 12.99, "Office"],
        [10, "Protein Powder", 34.99, "Sports"]
      ];
      
      for (const [id, name, price, category] of sampleProducts) {
        await connection.runAndReadAll(
          "INSERT INTO products (id, name, price, category) VALUES (?, ?, ?, ?)",
          [id, name, price, category]
        );
        console.log(`  🛍️  Added product: ${name} ($${price})`);
      }
    } else {
      console.log(`📊 Database already contains ${userCount} users - skipping sample data`);
    }
    
    // Show summary statistics
    const finalUserCount = await connection.runAndReadAll("SELECT COUNT(*) as count FROM users");
    const finalProductCount = await connection.runAndReadAll("SELECT COUNT(*) as count FROM products");
    
    const userTotal = Number(finalUserCount.getRows()[0][0]);
    const productTotal = Number(finalProductCount.getRows()[0][0]);
    
    console.log("\n📊 Database Summary:");
    console.log(`   Users: ${userTotal}`);
    console.log(`   Products: ${productTotal}`);
    
    // Show analytics sample
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
    
    console.log("\n🔍 Analytics by Category:");
    const analyticsRows = analyticsResult.getRows();
    const analyticsColumns = analyticsResult.columnNames();
    
    analyticsRows.forEach((row: any[]) => {
      const category = row[0];
      const count = Number(row[1]);
      const avgPrice = Number(row[2]);
      const maxPrice = Number(row[3]);
      const minPrice = Number(row[4]);
      
      console.log(`   ${category}: ${count} products, avg $${avgPrice.toFixed(2)}, range $${minPrice}-$${maxPrice}`);
    });
    
    console.log("\n✅ Database initialization complete!");
    console.log("🚀 Start the API server with: deno task dev");
    
    // Checkpoint to merge WAL back to main database file
    await connection.runAndReadAll("CHECKPOINT");
    
    // Properly disconnect to prevent WAL files
    connection.disconnectSync();
    
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await initializeDatabase();
} 