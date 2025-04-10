import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { list } from 'postcss';

Meteor.methods({
    async 'users.insert'(data) {
        check(data, {
            username: String,
            email: String,
            password: String,
            role: Array,
        });
        
        try {
          // Try to create a user
          return Accounts.createUser({
            username: data.username,
            email: data.email,
            password: data.password,
            role: data.role,
            createdAt: new Date(),
          });
        } 
        // TODO: Implement these errors into the user adding somehow
        catch (error) {
          if (error.error === 403) {
            // Example: Error due to duplicate username or email
            throw new Meteor.Error('duplicate-credentials', 'The username or email is already taken.');
          } else if (error.error === 400) {
            // Example: Invalid password or other issues
            throw new Meteor.Error('invalid-password', 'Password must meet the required criteria.');
          }
          // Generic error message for other unhandled errors
          throw new Meteor.Error('unknown-error', 'An unknown error occurred while creating the user.');
        }
    },
    async 'users.remove'(userId) {
        check(userId, String);
        return await Meteor.users.removeAsync(userId);
    },
    async 'users.update'(userId, data) {
        check(userId, String);
        check(data, Match.ObjectIncluding({
            username: String,
            email: String,
            role: Array,
        }));
        
        return await Meteor.users.updateAsync(userId, {
            $set: {
                username: data.username,
                'emails.0.address': data.email,
                role: data.role,
            }
        });
    }
});