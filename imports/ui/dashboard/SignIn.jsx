import React from 'react'

const SignIn = ({isPopupOpen, togglePopup}) => {
    const handleSignIn = (e) => {
        e.preventDefault();
        alert('Sign In Sucessful');
        togglePopup();
    };
    if(!isPopupOpen) return null;
    return (
        <div style = {{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgb(255, 255, 255)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: '20px',
                width: '300px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}>
                <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Sign In</h3>
                <form onSubmit={handleSignIn}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                    <input
                    type="email"
                    required
                    style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                    }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                    <input
                    type="password"
                    required
                    style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                    }}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#7a223a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    }}
                >
                    Sign In
                </button>
                </form>
                <button
                style={{
                    marginTop: '10px',
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#ccc',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
                onClick={togglePopup}
                >
                Cancel
                </button>
            </div>
        </div>
    )
}

export default SignIn;