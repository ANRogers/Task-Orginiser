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

export async function addWorkspace(name: string, colour: string){
    const db = await getDatabase();

    await db.execute(
        `INSERT INTO workspaces (name, colour) VALUES ($1, $2)`, [name, colour]
    )
}

export async function modifyWorkspace(
    id: number,
    name: string,
    colour: string
) {
    const db = await getDatabase();

    await db.execute(
        `UPDATE workspaces
         SET name = $1,
             colour = $2
         WHERE id = $3`,
        [name, colour, id]
    );
}

export async function deleteWorkspace(id: number) {
    // Stop the default workspace from being removed
    if (id === 1) {
        return;
    }

    const db = await getDatabase();

    // Reassign tasks to the default workspace
    await db.execute(
        `UPDATE tasks
         SET workspace_id = 1
         WHERE workspace_id = ?`,
        [id]
    );

    // Delete the workspace
    await db.execute(
        `DELETE FROM workspaces
         WHERE id = ?`,
        [id]
    );
}