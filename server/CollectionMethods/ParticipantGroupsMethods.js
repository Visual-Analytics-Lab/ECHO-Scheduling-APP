import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { ParticipantGroupsCollection } from '../../imports/api/collections';

// Required fields and their type must be included in the insert and update method checks
Meteor.methods({
    async 'participantGroups.insert'(data) {
        //console.log('Received data:', data);
        check(data, Match.ObjectIncluding({
            name: String,
            series_ids: [String],
            agency: String,
            focus: String,
            famOrPro: String,
        }));
        
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
        check(data, Match.ObjectIncluding({
          name: String,
          series_ids: [String],
          agency: String,
          focus: String,
          famOrPro: String,
        }));
        return await ParticipantGroupsCollection.updateAsync(participantGroupsId, {
            $set: data
        });
    }
});