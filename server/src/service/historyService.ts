import pkg from 'pg';
import { v4 as UUID } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
// ✅ PostgreSQL Connection Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render-provided database URL
  ssl: {
    rejectUnauthorized: false, // Required for Render PostgreSQL
  },
});

// ✅ Define a City class
class City {
  name: string;
  id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

// ✅ History Service with PostgreSQL
class HistoryService {
  private dbPath = path.join(process.cwd(), 'db/db.json'); // Path for old JSON data

  // ✅ Ensure the table exists
  public async initializeTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        city TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    await this.importOldData(); // ✅ Migrate existing `db.json` data
  }

  // ✅ Import data from `db.json` (runs once)
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

      // ✅ Delete `db.json` after migration to avoid duplication
      await fs.unlink(this.dbPath);
      console.log('Migration complete. db.json removed.');
    } catch (error) {
      console.error('Error importing data:', error);
    }
  }

  // ✅ Get all searched cities
  async getCities(): Promise<City[]> {
    const result = await pool.query(
      'SELECT * FROM history ORDER BY timestamp DESC;'
    );
    return result.rows.map((row) => new City(row.city, row.id));
  }

  // ✅ Add a new city to history
  async addCity(city: string) {
    if (!city) throw new Error('City name cannot be empty');

    const newCity = new City(city, UUID());
    await pool.query('INSERT INTO history (id, city) VALUES ($1, $2);', [
      newCity.id,
      newCity.name,
    ]);
    return newCity;
  }

  // ✅ Remove a city from history
  async removeCity(id: string) {
    await pool.query('DELETE FROM history WHERE id = $1;', [id]);
  }
}

// ✅ Initialize database and migrate old data
const historyService = new HistoryService();
historyService.initializeTable().catch(console.error);

export default historyService;

// import fs from 'node:fs/promises';
// import { v4 as UUID } from 'uuid';

// // TODO: Define a City class with name and id properties
// class City {
//   name: string;
//   id: string;

//   constructor(name: string, id: string) {
//     this.name = name;
//     this.id = id;
//   }
// }

// // TODO: Complete the HistoryService class
// class HistoryService {
//   // TODO: Define a read method that reads from the searchHistory.json file
//   private async read() {
//     return await fs.readFile('db/db.json', {
//       flag: 'a+',
//       encoding: 'utf8',
//     });
//   }

//   // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
//   private async write(cities: City[]) {
//     return await fs.writeFile('db/db.json', JSON.stringify(cities, null, '\t'));
//   }

//   // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
//   async getCities() {
//     return await this.read().then((cities) => {
//       let parsedCities: City[];
//       try {
//         parsedCities = [].concat(JSON.parse(cities));
//       } catch (err) {
//         parsedCities = [];
//       }
//       return parsedCities;
//     });
//   }

//   // TODO Define an addCity method that adds a city to the searchHistory.json file
//   async addCity(city: string) {
//     if (!city) {
//       throw new Error('City name cannot be empty');
//     }
//     const newCity: City = { name: city, id: UUID() };
//     return await this.getCities()
//       .then((cities) => {
//         if (cities.find((index) => index.name === city)) {
//           return cities;
//         }
//         return [...cities, newCity];
//       })
//       .then((updatedCities) => this.write(updatedCities))
//       .then(() => newCity);
//   }

//   // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
//   async removeCity(id: string) {
//     return await this.getCities()
//       .then((cities) => cities.filter((city) => city.id !== id))
//       .then((filteredCities) => this.write(filteredCities));
//   }
// }

// export default new HistoryService();
