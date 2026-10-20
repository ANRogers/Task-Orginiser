import { getDatabase } from '../database';

// Types returned by the database

export interface Workspace {
    id: number;
    name: string;
    colour: string;
    created_at: string;
    
}

export async function getWorkspaces(){
    const db = await getDatabase();
    
    return db.select<Workspace[]>(
        `SELECT * from workspaces`
    );
}

