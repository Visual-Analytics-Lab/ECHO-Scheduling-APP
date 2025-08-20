import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { SpecialistsCollection } from '/imports/api/collections';

Meteor.startup(() => {
  (async function backfillSpecialists() {
    const orphaned = await SpecialistsCollection.find({ userId: { $exists: false } }).fetch();

    console.log(`Found ${orphaned.length} orphaned specialists`);

    for (const specialist of orphaned) {
      const email = specialist.email?.trim().toLowerCase();
      if (!email) {
        console.warn(`Skipping specialist ${specialist._id} (no email)`);
        continue;
      }

      let user = await Meteor.users.findOneAsync({ 'emails.address': email });
      let userId;

      if (user) {
        userId = user._id;
      } else {
        userId = Accounts.createUser({
          email,
          profile: {
            firstName: specialist.firstName,
            lastName: specialist.lastName,
          },
        });
        console.log(`Created user ${userId} for specialist ${specialist._id}`);
      }

      await SpecialistsCollection.updateAsync(specialist._id, {
        $set: { userId }
      });

      await Meteor.users.updateAsync(userId, {
        $set: {
          firstName: specialist.firstName,
          lastName: specialist.lastName,
        }
      });
    }

    console.log('✅ Backfill complete');
  })();
});
