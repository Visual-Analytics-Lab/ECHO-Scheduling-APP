import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SemesterCollection } from '../../imports/api/collections';

// Required fields and their type must be included in the insert and update method checks
// TODO: update required checks
Meteor.methods({
    async 'semesters.insert'(data) {
        //console.log('Received data:', data);
        check(data, Match.ObjectIncluding({
            title: String,
            startDate: Date,
            endDate: Date,
        }));
        
        const semesterGroupID = await SemesterCollection.insertAsync({
            ...data,
            createdAt: new Date(),
        });
        //console.log('Inserted specialist with ID:', semesterGroupID);
        return semesterGroupID;
    },
    async 'semesters.remove'(semesterGroupID) {
        check(semesterGroupID, String);
        return await SemesterCollection.removeAsync(semesterGroupID);
    },
    async 'semesters.update'(semesterGroupID, data) {
        check(semesterGroupID, String);
        check(data, Match.ObjectIncluding({
            title: String,
            startDate: Date,
            endDate: Date,
        }));
        return await SemesterCollection.updateAsync(semesterGroupID, {
            $set: data
        });
    }
});