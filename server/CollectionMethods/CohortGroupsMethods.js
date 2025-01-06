import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { CohortGroupsCollection } from '../../imports/api/collections';

Meteor.methods({
    async 'cohortGroups.insert'(data) {
        //console.log('Received data:', data);
        check(data, {
            title: String,
            description: String,
        });
        
        const cohortGroupsId = await CohortGroupsCollection.insertAsync({
            ...data,
            createdAt: new Date(),
        });
        //console.log('Inserted specialist with ID:', cohortGroupsId);
        return cohortGroupsId;
    },
    'cohortGroups.remove'(cohortGroupsId) {
        check(cohortGroupsId, String);
        return CohortGroupsCollection.remove(cohortGroupsId);
    },
    'cohortGroups.update'(cohortGroupsId, data) {
        check(cohortGroupsId, String);
        check(data, {
            title: String,
            description: String
        });
        return CohortGroupsCollection.update(cohortGroupsId, {
            $set: data
        });
    }
});