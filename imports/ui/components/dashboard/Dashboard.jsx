import React from 'react'
import Navbar from '../navbar/Navbar';
import MainContent from './MainContent'

export const Dashboard = () => (
    <div style = {{display: 'flex', height: '100vh'}}>
        <div style={{flex: 1}}>
            <MainContent />
        </div>
    </div>
);