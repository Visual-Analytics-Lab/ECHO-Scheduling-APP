import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SemesterCollection } from '../../imports/api/collections';

Meteor.methods({
    async 'semesters.insert'(data) {
        //console.log('Received data:', data);
        check(data, {
            title: String,
            description: String,
            startDate: String,
            endDate: String,
            series: [String]
        });
        
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
        check(data, {
            title: String,
            description: String,
            startDate: String,
            endDate: String,
            series: [String]
        });
        return await SemesterCollection.updateAsync(semesterGroupID, {
            $set: data
        });
    }
});