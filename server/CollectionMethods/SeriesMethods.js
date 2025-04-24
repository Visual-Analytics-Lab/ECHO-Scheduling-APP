import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SeriesCollection } from '../../imports/api/collections';

// Required fields and their type must be included in the insert and update method checks
Meteor.methods({
    async 'series.insert'(data) {
        //console.log('Received data:', data);
        check(data, Match.ObjectIncluding({
            title: String,
        }));
        
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
        check(data, Match.ObjectIncluding({
            title: String,
        }));
        return await SeriesCollection.updateAsync(seriesGroupID, {
            $set: data
        });
    }
});