import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.methods({
    async 'users.insert'(data) {
        //console.log('Received data:', data);
        check(data, {
            id: String,
            email: String,
            password: String,
        });
        
        //console.log('Inserted specialist with ID:', cohortGroupsId);
        return Accounts.createUser({
            ...data,
            createdAt: new Date(),
          });
    },
    async 'users.remove'(cohortGroupsId) {
        check(cohortGroupsId, String);
        return await CohortGroupsCollection.removeAsync(cohortGroupsId);
    },
    async 'users.update'(cohortGroupsId, data) {
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