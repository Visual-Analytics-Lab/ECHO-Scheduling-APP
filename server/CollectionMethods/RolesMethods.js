import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { RolesCollection } from '../../imports/api/collections';

Meteor.methods({
    async 'roles.insert'(data) {
        //console.log('Received data:', data);
        check(data, {
            title: String,
            desc: String,
        });
        
        const roleGroupID = await RolesCollection.insertAsync({
            ...data,
            createdAt: new Date(),
        });
        return roleGroupID;
    },
    async 'roles.remove'(roleGroupID) {
        check(roleGroupID, String);
        return await RolesCollection.removeAsync(roleGroupID);
    },
    async 'roles.update'(roleGroupID, data) {
        check(roleGroupID, String);
        check(data, {
            title: String,
            desc: String,
        });
        return await RolesCollection.updateAsync(roleGroupID, {
            $set: data
        });
    }
});