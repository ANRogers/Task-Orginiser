
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { initialiseDatabase } from './database';

import { generateOccurrences } from './recurrence';

import HomePage from './Pages/HomePage';
import TasksPage from './Pages/TasksPage';

function App() {
    const [dbReady, setDbReady] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);

    useEffect(() => {
        async function setupApp() {
            try {
                // Initialise the database first.
                await initialiseDatabase();
                console.log('Database initialised');

                // Wait until all occurrences have been generated.
                await generateOccurrences();
                console.log('Occurrences initialised');

                // Only load the pages once everything is ready.
                setDbReady(true);
            } catch (error) {
                console.error('App setup failed:', error);
                setDbError(String(error));
            }
        }

        setupApp();
    }, []);

    if (dbError) {
        return <p>Database error: {dbError}</p>;
    }

    if (!dbReady) {
        return <p>Loading your tasks...</p>;
    }

    return (
        <BrowserRouter>
            <main className="app-container">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;
