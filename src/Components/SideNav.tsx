import { useState, useEffect } from "react";
import '../styles/SideNav.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCalendarDays, faClock, faCircleCheck, faClipboardList, faTableList } from '@fortawesome/free-solid-svg-icons';

import {
    addWorkspace,
  getWorkspaces,

  type Workspace
} from '../services/WorkspaceService'

export default function SideNavBar() {

    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

    async function loadWorkspaces() {
          try{
            const collections = await getWorkspaces();
            setWorkspaces(collections);
          } catch(error){
            console.error('failed to load workspaces:', error);
          }
        }

    
    //loading call
    useEffect(() => {
    loadWorkspaces();
    }, []);

    //adding a workspace
    const [collectionName, setCollectionName] = useState("");
    const [collectionColour, setCollectionColour] = useState("#FFFFFF");

    async function addCollection() {
        await addWorkspace(collectionName, collectionColour);
        await loadWorkspaces();
        setCollectionName("");
        setCollectionColour("#FFFFFF");
    }

    return (
     <div className="nav-sidebar">
        <div className="workspace">
            <h5 className="workspace-title">WORKSPACE</h5>
            <div className="worspace-nav-option">
                <FontAwesomeIcon icon={faTableList} /> Dashboard
            </div>
            <div className="worspace-nav-option">
                <FontAwesomeIcon icon={faCircleCheck} /> Tasks
            </div>
            <div className="worspace-nav-option">
                <FontAwesomeIcon icon={faCalendarDays} /> Calander
            </div>
            <div className="worspace-nav-option">
                <FontAwesomeIcon icon={faClock} /> Overdue
            </div>
            <div className="worspace-nav-option">
                <FontAwesomeIcon icon={faClipboardList} /> Stastistics
            </div>
                  
        </div>
        <div className="collections">
            <div className="collections-title-box">
                <h5 className="collections-title">COLLECTIONS</h5>
                <button className="add-collection-btn" data-bs-toggle="dialog" data-bs-target="#AddCollectionOverlay" data-bs-backdrop="static"><FontAwesomeIcon icon={faPlus} /></button>
            </div>
            <div className="collections-option">
                {workspaces.map((workspace) => (
                <div className="collection-option-box">
                    <div className="collection-option-colour" style={{backgroundColor: workspace.colour}}></div>
                    <h1 className="collection-option-title">{workspace.name}</h1>
                </div>
                )

                )}
                
            </div>
        </div>  
        <dialog className="dialog add-task-dialog" id="AddCollectionOverlay">
          <div className="dialog-header">
            <h1 className="dialog-title">Create a Collection</h1>
            
          </div>
          <form onSubmit={addCollection}>
          <div className="dialog-body">
            
            <div className="add-task-input-box">
              <h5>Collection Name</h5>
              <input className="add-task-text-input" type="text" id="taskName" value={collectionName} placeholder="Enter Collection Name" required onChange={e => setCollectionName(e.target.value)}></input>
            </div>

            <div className="add-task-input-box">
              <h5>Colour</h5>
              <input type="color" className="add-collection-colour-input" id="taskNote" placeholder="Enter Notes" value={collectionColour} onChange={e => setCollectionColour(e.target.value)}></input>
            </div>

            
              

              
            
          </div>
          <div className="dialog-footer">
            <button type="button" className="btn-solid theme-secondary add-task-cancel-btn" data-bs-dismiss="dialog">Cancel</button>
            <button type="submit" className="btn-solid theme-secondary add-task-submit-btn" data-bs-dismiss="dialog"><FontAwesomeIcon icon={faPlus} />Create Collection</button>
          </div>
          </form>
        </dialog>
    </div>   
    )
}