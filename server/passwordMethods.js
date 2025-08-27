// /server/passwordMethods.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';

Meteor.methods({
  async 'admin.resetUserPassword'(userId) {
    check(userId, String);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Must be logged in');
    }
    
    const targetUser = await Meteor.users.findOneAsync(userId);
    if (!targetUser) {
      throw new Meteor.Error('user-not-found', 'User not found');
    }
    
    try {
      // Generate a password reset token
      const token = Accounts._generateStampedLoginToken();
      const tokenRecord = { ...token, reason: 'reset' };
      
      // Add the token to user's services
      await Meteor.users.updateAsync(userId, {
        $push: {
          'services.password.reset': tokenRecord
        }
      });
      
      // Return the reset URL that you can give to the user
      const resetUrl = Meteor.absoluteUrl(`reset-password/${token.token}`);
      
      return { 
        success: true, 
        resetToken: token.token,
        resetUrl: resetUrl,
        message: 'Reset token generated. User can use this URL to set a new password.'
      };
      
    } catch (error) {
      console.error('Reset token generation failed:', error);
      throw new Meteor.Error('reset-failed', 'Failed to generate reset token: ' + error.message);
    }
  },

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