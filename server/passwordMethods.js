// Create this file: /server/passwordMethods.js

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { RolesCollection } from '../imports/api/collections'; // Adjust path if needed

Meteor.methods({
  // Simple admin/specialist reset password
  'users.resetPassword'(userId, newPassword) {
    check(userId, String);
    check(newPassword, String);
    
    // Check if current user is logged in
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized', 'Must be logged in');
    }
    
    const currentUser = Meteor.user();
    const adminRole = RolesCollection.findOne({ title: 'Admin' });
    const specialistRole = RolesCollection.findOne({ title: 'Specialist' }); // Adjust role name if different
    
    // Check if user is admin or specialist
    const isAdmin = adminRole && currentUser.role_id === adminRole._id;
    const isSpecialist = specialistRole && currentUser.role_id === specialistRole._id;
    
    if (!isAdmin && !isSpecialist) {
      throw new Meteor.Error('not-authorized', 'Admin or Specialist access required');
    }
    
    if (newPassword.length < 6) {
      throw new Meteor.Error('password-too-short', 'Password must be at least 6 characters');
    }
    
    try {
      Accounts.setPassword(userId, newPassword);
      return { success: true };
    } catch (error) {
      throw new Meteor.Error('reset-failed', 'Failed to reset password');
    }
  }
});