import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SpecialistsCollection } from '../../imports/api/collections';

Meteor.methods({
    async 'specialists.insert'(data) {
        //console.log('Received data:', data);
        check(data, {
            name: String,
            speciality: String,
            email: String,
            phone: String,
            institute: String
        });
        
        const specialistId = await SpecialistsCollection.insertAsync({
            ...data,
            createdAt: new Date(),
        });
        //console.log('Inserted specialist with ID:', specialistId);
        return specialistId;
    },
    'specialists.remove'(specialistId) {
        check(specialistId, String);
        return SpecialistsCollection.remove(specialistId);
    },
    'specialists.update'(specialistId, data) {
        check(specialistId, String);
        check(data, {
            name: String,
            speciality: String,
            email: String,
            phone: String,
            institute: String
        });
        return SpecialistsCollection.update(specialistId, {
            $set: data
        });
    }
});