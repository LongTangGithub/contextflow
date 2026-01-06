import { Pool, QueryResult, QueryResultRow } from 'pg';

// Singleton pattern: create one for the entire app
let pool: Pool | null = null;

/**
 * Get or create database connection pool 
 * Uses singleton pattern to reuse connections across requests
 */

export function getPool(): Pool {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,

            // Connection pool configuration
            max: 10,                          // Max number of clients in pool
            min: 2,                          // Min number of clients in pool
            idleTimeoutMillis: 30000,       // Close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // Return error after 2 seconds if no connection available
        });

        // Log pool events for debugging
        pool.on('connect', () => {
            console.log('Database connection established');
        });

        pool.on('error', (err) => {
            console.error('Unexpected database error:', err);
        });
    }

    return pool;
}

/**
 * Execute a database query
 * @param text - SQL query string
 * @param params - Query parameters (prevents SQL injection)
 * @returns Query result
 */
export async function query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
): Promise<QueryResult<T>> {
    const pool = getPool();
    const start = Date.now();

    try {
        const result = await pool.query<T>(text, params);
        const duration = Date.now() - start;

        // Log slow queries (>100ms)
        if (duration > 100) {
            console.warn(`Slow query (${duration}ms):`, text);
        }

        return result;
    } catch (error) {
        console.error('Database query error:', error);
        console.error('Query:', text);
        console.error('Params:', params);
        throw error;
    }
}

/**
 * Close the database pool
 * Call this when shutting down the application
 */
export async function closePool(): Promise<void> {
    if (pool) {
      await pool.end();
      pool = null;
      console.log('Database pool closed');
    }
}


/**
 * Test database connection
 * @returns true if connection successful
 */
export async function testConnection(): Promise<boolean> {
    try {
      const result = await query('SELECT NOW() as current_time, version() as pg_version');
      console.log('Database connection test successful');
      console.log('PostgreSQL version:', result.rows[0].pg_version);
      console.log('Current time:', result.rows[0].current_time);
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
}

/**
 * Test pgvector extension
 * @returns true if pgvector is available
 */
export async function testPgVector(): Promise<boolean> {
    try {
      const result = await query(`
        SELECT installed_version 
        FROM pg_available_extensions 
        WHERE name = 'vector'
      `);
      
      if (result.rows.length > 0 && result.rows[0].installed_version) {
        console.log('pgvector extension installed:', result.rows[0].installed_version);
        return true;
      } else {
        console.error('pgvector extension not installed');
        return false;
      }
    } catch (error) {
      console.error('pgvector test failed:', error);
      return false;
    }
}