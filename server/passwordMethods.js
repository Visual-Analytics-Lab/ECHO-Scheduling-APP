// /server/passwordMethods.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';

Meteor.methods({
  // Admin/Specialist manual password reset
  async 'admin.resetUserPassword'(userId, newPassword) {
    check(userId, String);
    check(newPassword, String);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Must be logged in');
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
  },

  // Get user list - simplified permissions
  async 'admin.getUserList'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Must be logged in');
    }

    return Meteor.users.find({}, {
      fields: {
        username: 1,
        emails: 1,
        createdAt: 1
      }
    }).fetch();
  }
});