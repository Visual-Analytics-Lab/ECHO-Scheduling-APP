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

    const email = targetUser.emails?.[0]?.address;
    if (!email) {
      throw new Meteor.Error('no-email', 'Target user has no email address');
    }

    try {
      // Generate a reset token
      const stampedToken = Accounts._generateStampedLoginToken();
      const tokenRecord = {
        token: stampedToken.token,
        email: email,         // REQUIRED for Accounts.resetPassword()
        when: new Date(),
        reason: 'reset'
      };

      // Store the reset token (replace any old ones)
      await Meteor.users.updateAsync(userId, {
        $set: {
          'services.password.reset': tokenRecord
        }
      });

      // Build the reset URL
      const resetUrl = Meteor.absoluteUrl(`reset-password/${stampedToken.token}`);

      return {
        success: true,
        resetToken: stampedToken.token,
        resetUrl,
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
