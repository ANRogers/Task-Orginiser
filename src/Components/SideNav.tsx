import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import '../styles/SideNav.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCalendarDays, faEllipsisVertical, faCircleCheck, faClipboardList, faTableList } from '@fortawesome/free-solid-svg-icons';

import {
    addWorkspace,
    deleteWorkspace,
    modifyWorkspace,
  getWorkspaces,

  type Workspace
} from '../services/WorkspaceService'

import MouseLogo from "../assets/Mouse_Logo_Synthwave_Transparent.png"

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

    async function addCollection(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      await addWorkspace(collectionName, collectionColour);

      setCollectionName("");
      setCollectionColour("#FFFFFF");

      await loadWorkspaces();

      const dialog = document.getElementById("AddCollectionOverlay");
      if (dialog instanceof HTMLDialogElement) {
          dialog.close();
      }
  }

    //editing a workspace
    const [editCollectionName, setEditCollectionName] = useState("Personal");
    const [editCollectionColour, setEditCollectionColour] = useState("#FFFFFF");
    const [editCollectionId, setEditCollectionId] = useState(1);

    function openEditCollection(collection : Workspace) {
          setEditCollectionName(collection.name);
          setEditCollectionColour(collection.colour);
          setEditCollectionId(collection.id)
    
          const dialog = document.getElementById("editCollectionOverlay");
    
          if (dialog instanceof HTMLDialogElement) {
              dialog.showModal();
          }
      }

    async function editCollection(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      await modifyWorkspace(editCollectionId,editCollectionName,editCollectionColour);
      setEditCollectionName("Personal");
      setEditCollectionColour("#FFFFFF");
      setEditCollectionId(1);

      await loadWorkspaces();
      const dialog = document.getElementById("editCollectionOverlay");
      if(dialog instanceof HTMLDialogElement){
        dialog.close();
      }
    }

    return (
     <div className="nav-sidebar">
      <div className="image-container">
        <img className="side-nav-logo" src={MouseLogo} alt="Logo" />
      </div>
        <div className="workspace">
            <h5 className="workspace-title">WORKSPACE</h5>
            <Link to="/" className="workspace-nav-link">
            <div className="worspace-nav-option">
                <FontAwesomeIcon icon={faTableList} /> Dashboard
            </div>
            </Link>
            <Link to="/tasks" className="workspace-nav-link">
            <div className="worspace-nav-option">
                <FontAwesomeIcon icon={faCircleCheck} /> Tasks
            </div>
            </Link>
            <Link to="/calendar" className="workspace-nav-link">
            <div className="worspace-nav-option">
                <FontAwesomeIcon icon={faCalendarDays} /> Calander
            </div>
            </Link>
            <Link to="/statistic" className="workspace-nav-link">
            <div className="worspace-nav-option">
                <FontAwesomeIcon icon={faClipboardList} /> Stastistics
            </div>
            </Link>
            
                  
        </div>
        <div className="collections">
            <div className="collections-title-box">
                <h5 className="collections-title">COLLECTIONS</h5>
                <button className="add-collection-btn" data-bs-toggle="dialog" data-bs-target="#AddCollectionOverlay" data-bs-backdrop="static"><FontAwesomeIcon icon={faPlus} /></button>
            </div>
            <div className="collections-option">
                {workspaces.map(workspace => (
                    <div className="collection-option-box" key={workspace.id}>
                    <div className="collection-option-info">
                        <div
                            className="collection-option-colour"
                            style={{ backgroundColor: workspace.colour }}
                        />

                        <h1 className="collection-option-title">
                            {workspace.name}
                        </h1>
                    </div>

                    <button className="task-options-btn" type="button" aria-label="Task options" data-bs-toggle="menu" aria-expanded="false">
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                    </button>
                    <div className="menu task-menu">
                        
                        <a className="menu-item task-menu-item" onClick={async () => {
                            await openEditCollection(workspace);
                        }}>Modify Collection</a>
                        {workspace.id !== 1 && (
                        <a className="menu-item task-menu-item-delete" onClick={async () => {
                                await deleteWorkspace(workspace.id);

                                await loadWorkspaces();
                            }}>Remove Collection</a>
                        )}
                        </div>
                        
                        
                    </div>
                ))}
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


        {/* edit workspace */}
        <dialog className="dialog add-task-dialog" id="editCollectionOverlay">
          <div className="dialog-header">
            <h1 className="dialog-title">Modify a Collection</h1>
            
          </div>
          <form onSubmit={editCollection}>
          <div className="dialog-body">
            
            <div className="add-task-input-box">
              <h5>Collection Name</h5>
              <input className="add-task-text-input" type="text" id="taskName" value={editCollectionName} placeholder="Enter Collection Name" required onChange={e => setEditCollectionName(e.target.value)}></input>
            </div>

            <div className="add-task-input-box">
              <h5>Colour</h5>
              <input type="color" className="add-collection-colour-input" id="taskNote" placeholder="Enter Notes" value={editCollectionColour} onChange={e => setEditCollectionColour(e.target.value)}></input>
            </div>

            
              

              
            
          </div>
          <div className="dialog-footer">
            <button type="button" className="btn-solid theme-secondary add-task-cancel-btn" data-bs-dismiss="dialog">Cancel</button>
            <button type="submit" className="btn-solid theme-secondary add-task-submit-btn" data-bs-dismiss="dialog"><FontAwesomeIcon icon={faPlus} />Modify Collection</button>
          </div>
          </form>
        </dialog>

    </div>   
    )
}