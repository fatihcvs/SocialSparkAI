```javascript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Initialize the connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Optimize queries by setting appropriate pool options
pool.on('connect', (client) => {
  // Set session-level settings for performance optimization
  client.query('SET statement_timeout TO 5000'); // Set a timeout for queries
  client.query('SET work_mem TO "4MB"'); // Adjust work memory for complex queries
  client.query('SET maintenance_work_mem TO "64MB"'); // Optimize maintenance operations
});

// Initialize the database with the drizzle ORM
export const db = drizzle({ client: pool, schema });

// Add necessary indexes to improve query performance
async function createIndexes() {
  try {
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_order_date ON orders(order_date);
      CREATE INDEX IF NOT EXISTS idx_product_category ON products(category_id);
    `);
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
}

// Call the function to create indexes
createIndexes();
```

### Explanation:
1. **Connection Pool Optimization**: Added session-level settings to optimize query performance, such as setting a statement timeout and adjusting memory settings.
2. **Index Creation**: Added a function `createIndexes` to create indexes on commonly queried columns, which can significantly improve query performance.
3. **Error Handling**: Included error handling for index creation to ensure any issues are logged for debugging.