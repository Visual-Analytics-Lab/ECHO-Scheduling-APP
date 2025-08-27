// /server/passwordMethods.js
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.methods({
  async 'admin.resetUserPassword'(userId, newPassword) {
    check(userId, String);
    check(newPassword, String);
    
    console.log('Reset password called for userId:', userId);
    console.log('New password length:', newPassword.length);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Must be logged in');
    }
    
    if (newPassword.length < 6) {
      throw new Meteor.Error('password-too-short', 'Password must be at least 6 characters');
    }
    
    const targetUser = await Meteor.users.findOneAsync(userId);
    if (!targetUser) {
      throw new Meteor.Error('user-not-found', 'User not found');
    }
    
    console.log('Target user found:', targetUser.username || targetUser.emails?.[0]?.address);
    
    try {
      // Clear the existing password first
      await Meteor.users.updateAsync(userId, {
        $unset: {
          'services.password': 1
        }
      });
      
      // Use the standard method to create a new user with password
      // Since we can't set password directly, we'll update the services field manually
      const hashedPassword = Package.sha.SHA256(newPassword);
      
      await Meteor.users.updateAsync(userId, {
        $set: {
          'services.password': {
            bcrypt: hashedPassword
          }
        }
      });
      
      console.log('Password set successfully');
      return { success: true };
    } catch (error) {
      console.error('Password update failed:', error);
      throw new Meteor.Error('reset-failed', 'Failed to reset password: ' + error.message);
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