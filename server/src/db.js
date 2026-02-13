import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.postgresUrl
});

export async function withClient(fn) {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

export async function createJob({ id, url }) {
  const result = await pool.query(
    `INSERT INTO product_marketing_jobs (id, url, status)
     VALUES ($1, $2, 'queued')
     RETURNING *`,
    [id, url]
  );
  return result.rows[0];
}

export async function updateJob(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return;

  const setClauses = keys.map((key, idx) => `${key} = $${idx + 1}`);
  const values = keys.map((key) => fields[key]);

  await pool.query(
    `UPDATE product_marketing_jobs
     SET ${setClauses.join(", ")}, updated_at = NOW()
     WHERE id = $${keys.length + 1}`,
    [...values, id]
  );
}

export async function getJob(id) {
  const result = await pool.query(
    `SELECT * FROM product_marketing_jobs WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}
