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

  // Add indexing to frequently queried columns
  client.query('CREATE INDEX IF NOT EXISTS idx_content_ideas_title ON content_ideas(title)');
  client.query('CREATE INDEX IF NOT EXISTS idx_content_ideas_created_at ON content_ideas(created_at)');
  client.query('CREATE INDEX IF NOT EXISTS idx_post_assets_post_id ON post_assets(post_id)');
  client.query('CREATE INDEX IF NOT EXISTS idx_post_assets_asset_type ON post_assets(asset_type)');
});

// Initialize the database with the drizzle ORM
export const db = drizzle({ client: pool, schema });
```

### Explanation:
- Added SQL commands to create indexes on frequently queried columns in the `content_ideas` and `post_assets` tables.
- Used `CREATE INDEX IF NOT EXISTS` to ensure that indexes are only created if they do not already exist, preventing errors during repeated connections.
- Indexed `title` and `created_at` columns in the `content_ideas` table and `post_id` and `asset_type` columns in the `post_assets` table to improve query performance.