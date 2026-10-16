import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,
   faTableList} from '@fortawesome/free-solid-svg-icons';

export default function WorkSpaceBar(){

    return(
        <div className="workspace-info">
            <div className="workspace-current">
                <FontAwesomeIcon icon={faTableList} />
                <span className="workspace-separator">|</span>
                <span>Dashboard</span>
            </div>
            <div className="workspace-actions">
                <div className="topbar-newtask">
                <FontAwesomeIcon icon={faPlus} /> New Task
            </div>
            </div>
            
        </div>
    )
}