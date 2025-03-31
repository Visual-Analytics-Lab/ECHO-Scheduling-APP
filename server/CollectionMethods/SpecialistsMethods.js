import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SpecialistsCollection } from '../../imports/api/collections';

Meteor.methods({
    async 'specialists.insert'(data) {
        //console.log('Received data:', data);
        check(data, Match.ObjectIncluding({
          firstName: String,
          lastName: String,
          email: String,
        }));
        
        const specialistId = await SpecialistsCollection.insertAsync({
            ...data,
            createdAt: new Date(),
        });
        //console.log('Inserted specialist with ID:', specialistId);
        return specialistId;
    },
    async 'specialists.remove'(specialistId) {
        check(specialistId, String);
        return await SpecialistsCollection.removeAsync(specialistId);
    },
    async 'specialists.update'(specialistId, data) {
        check(specialistId, String);
        check(data, Match.ObjectIncluding({
          firstName: String,
          lastName: String,
          email: String,
        }));
        return await SpecialistsCollection.updateAsync(specialistId, {
            $set: data
        });
    }
});