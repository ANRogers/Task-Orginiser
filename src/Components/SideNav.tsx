import '../styles/SideNav.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faClock, faCircleCheck, faClipboardList, faTableList } from '@fortawesome/free-solid-svg-icons';


export default function SideNavBar() {
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
            <h5 className="collections-title">COLLECTIONS</h5>
            <div className="collections-option">
                Personal
            </div>
        </div>  
    </div>   
    )
}