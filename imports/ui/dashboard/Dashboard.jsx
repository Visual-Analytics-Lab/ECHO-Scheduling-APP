import React from 'react'
import Navbar from '../Navbar'
import MainContent from './MainContent'

export const Dashboard = () => (
    <div style = {{display: 'flex', height: '100vh'}}>
        <div style={{flex: 1}}>
            <Navbar />
            <MainContent />
        </div>
    </div>
);