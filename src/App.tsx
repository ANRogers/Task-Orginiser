import { useEffect, useState } from 'react';
import { initialiseDatabase } from './database';
import { seedDatabase } from './databaseDummyData';

import HomePage from "./Pages/HomePage";

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    async function setupDatabase() {
      try {
        await initialiseDatabase();
        console.log('Database initialised');

        // await seedDatabase();
        // console.log('Dummy data seeded');

        setDbReady(true);
      } catch (error) {
        console.error('Database setup failed:', error);
        setDbError(String(error));
      }
    }

    setupDatabase();
  }, []);

  if (dbError) {
    return <p>Database error: {dbError}</p>;
  }

  if (!dbReady) {
    return <p>Loading your tasks...</p>;
  }
  return (
    <main className="app-container">
      <HomePage />
    </main>
  );
}

export default App;
