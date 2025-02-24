import pkg from 'pg';
import { v4 as UUID } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

class City {
  name: string;
  id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

class HistoryService {
  private dbPath = path.join(process.cwd(), 'db/db.json');

  public async initializeTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        city TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    await this.importOldData();
  }

  private async importOldData() {
    try {
      const fileExists = await fs
        .access(this.dbPath)
        .then(() => true)
        .catch(() => false);
      if (!fileExists) return;

      console.log('Importing data from db.json...');
      const data = JSON.parse(await fs.readFile(this.dbPath, 'utf-8'));
      for (const { name, id } of data) {
        await pool.query(
          'INSERT INTO history (id, city) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING;',
          [id, name]
        );
      }

      await fs.unlink(this.dbPath);
      console.log('Migration complete. db.json removed.');
    } catch (error) {
      console.error('Error importing data:', error);
    }
  }

  async getCities(): Promise<City[]> {
    const result = await pool.query(
      'SELECT * FROM history ORDER BY timestamp DESC;'
    );
    return result.rows.map((row) => new City(row.city, row.id));
  }

  async addCity(city: string) {
    if (!city) throw new Error('City name cannot be empty');

    const newCity = new City(city, UUID());
    await pool.query('INSERT INTO history (id, city) VALUES ($1, $2);', [
      newCity.id,
      newCity.name,
    ]);
    return newCity;
  }

  async removeCity(id: string) {
    await pool.query('DELETE FROM history WHERE id = $1;', [id]);
  }
}

const historyService = new HistoryService();
historyService.initializeTable().catch(console.error);

export default historyService;
