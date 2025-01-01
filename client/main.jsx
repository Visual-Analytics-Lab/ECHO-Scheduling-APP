import React from 'react';
import '../client/main.css';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';
import { App } from '/imports/ui/App';
import { Dashboard } from '../imports/ui/dashboard/Dashboard';

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  const root = createRoot(container);
  root.render(<Dashboard />);
});
