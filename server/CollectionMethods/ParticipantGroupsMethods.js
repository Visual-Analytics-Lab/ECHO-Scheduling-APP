import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ParticipantGroupsCollection } from '../../imports/api/collections';

Meteor.methods({
    async 'participantGroups.insert'(data) {
        //console.log('Received data:', data);
        check(data, {
            name: String,
            agency: String,
            email: String,
            phone: String,
            families: String
        });
        
        const participantGroupsId = await ParticipantGroupsCollection.insertAsync({
            ...data,
            createdAt: new Date(),
        });
        //console.log('Inserted specialist with ID:', participantGroupsId);
        return participantGroupsId;
    },
    async 'participantGroups.remove'(participantGroupsId) {
        check(participantGroupsId, String);
        return await ParticipantGroupsCollection.removeAsync(participantGroupsId);
    },
    async 'participantGroups.update'(participantGroupsId, data) {
        check(participantGroupsId, String);
        check(data, {
            name: String,
            agency: String,
            email: String,
            phone: String,
            families: String
        });
        return await ParticipantGroupsCollection.updateAsync(participantGroupsId, {
            $set: data
        });
    }
});