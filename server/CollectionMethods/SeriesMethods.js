import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SeriesCollection } from '../../imports/api/collections';

Meteor.methods({
    async 'series.insert'(data) {
        //console.log('Received data:', data);
        check(data, {
            title: String,
            description: String,
            startDate: String,
            endDate: String
        });
        
        const seriesGroupID = await SeriesCollection.insertAsync({
            ...data,
            createdAt: new Date(),
        });
        //console.log('Inserted specialist with ID:', seriesGroupID);
        return seriesGroupID;
    },
    async 'series.remove'(seriesGroupID) {
        check(seriesGroupID, String);
        return await SeriesCollection.removeAsync(seriesGroupID);
    },
    async 'series.update'(seriesGroupID, data) {
        check(seriesGroupID, String);
        check(data, {
            title: String,
            description: String,
            startDate: String,
            endDate: String
        });
        return await SeriesCollection.updateAsync(semesterGroupID, {
            $set: data
        });
    }
});