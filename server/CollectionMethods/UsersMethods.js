import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

Meteor.methods({
    async 'users.insert'(data) {
        check(data, {
            username: String,
            email: String,
            password: String,
        });
        
        return Accounts.createUser({
            username: data.username,
            email: data.email,
            password: data.password,
            createdAt: new Date(),
        });
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
        }));
        
        return await Meteor.users.updateAsync(userId, {
            $set: {
                username: data.username,
                'emails.0.address': data.email,
            }
        });
    }
});