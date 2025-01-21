import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { CohortGroupsCollection } from '../../imports/api/collections';

Meteor.methods({
    async 'cohortGroups.insert'(data) {
        //console.log('Received data:', data);
        check(data, {
            title: String,
            description: String,
            startDate: String,
            endDate: String
        });
        
        const cohortGroupsId = await CohortGroupsCollection.insertAsync({
            ...data,
            createdAt: new Date(),
        });
        //console.log('Inserted specialist with ID:', cohortGroupsId);
        return cohortGroupsId;
    },
    async 'cohortGroups.remove'(cohortGroupsId) {
        check(cohortGroupsId, String);
        return await CohortGroupsCollection.removeAsync(cohortGroupsId);
    },
    async 'cohortGroups.update'(cohortGroupsId, data) {
        check(cohortGroupsId, String);
        check(data, {
            title: String,
            description: String,
            startDate: String,
            endDate: String
        });
        return await CohortGroupsCollection.updateAsync(cohortGroupsId, {
            $set: data
        });
    }
});