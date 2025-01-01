import React, {useState} from 'react'
import SignIn from './SignIn'

const Navbar = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };
    return (
        <div style = {{
            height: '60px', 
            backgroundColor: '#721D35', 
            color: '#fff', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px'
            }}>
            <h3>Echo Scheduling App</h3>
            <button
                style = {{
                    backgroundColor: '#0EA6B2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
                onClick = {togglePopup}
                >
                    Sign In
            </button>
            <SignIn isPopupOpen={isPopupOpen} togglePopup={togglePopup}/>
        </div>
    );
};

export default Navbar;