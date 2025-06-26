import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SpecialistsCollection } from '../../imports/api/collections';

Meteor.methods({
  async 'users.insert'(data) {
    check(data, Match.ObjectIncluding({
      firstName: String,
      lastName: String,
      username: String,
      email: String,
      password: String,
      role_id: String,
    }));

    try {
      const email = data.email.trim().toLowerCase();

      // Step 1: Create the user without using `profile`
      const userId = await Accounts.createUser({
        username: data.username,
        email: email,
        password: data.password,
      });

      // Step 2: Update user with root-level fields
      await Meteor.users.updateAsync(userId, {
        $set: {
          firstName: data.firstName,
          lastName: data.lastName,
          role_id: data.role_id,
          // specialist_id: data.specialist_id,
          createdAt: new Date(),
        }
      });

      // Step 3: Insert into SpecialistsCollection if applicable
      const specialistRoleId = 'jDkfrfcuYsHazRMbD';
      if (data.role_id === specialistRoleId) {
        console.log("✅ User has specialist role, inserting into SpecialistsCollection");

        const specialistId = await SpecialistsCollection.insertAsync({
          firstName: data.firstName,
          lastName: data.lastName,
          email: email,
          userId: userId,
          createdAt: new Date()
        });

        await Meteor.users.updateAsync(userId, {
          $set: {
            specialist_id: [specialistId]
          }
        });
      } else {
        console.log("ℹ️ User role is not specialist, skipping insert into SpecialistsCollection");
      }

      return userId;

    } catch (error) {
      console.error("❌ Error in users.insert:", {
        message: error.message,
        stack: error.stack,
        error
      });

      if (error.error === 403) {
        throw new Meteor.Error('duplicate-credentials', 'The username or email is already taken.');
      } else if (error.error === 400) {
        throw new Meteor.Error('invalid-password', 'Password must meet the required criteria.');
      }

      throw new Meteor.Error('unknown-error', 'An unknown error occurred while creating the user.');
    }
  },

  async 'users.remove'(userId) {
    check(userId, String);

    await SpecialistsCollection.removeAsync({ userId });
    return await Meteor.users.removeAsync(userId);
  },

  async 'users.update'(userId, data) {
    check(userId, String);
    check(data, Match.ObjectIncluding({
      firstName: String,
      lastName: String,
      username: String,
      email: String,
      role_id: String,
    }));

    const specialistRoleId = 'jDkfrfcuYsHazRMbD';

    const oldUser = await Meteor.users.findOneAsync(userId);
    const wasSpecialist = oldUser?.role_id === specialistRoleId;
    const isNowSpecialist = data.role_id === specialistRoleId;

    const updateFields = {
      username: data.username,
      'emails.0.address': data.email,
      role_id: data.role_id,
      // specialist_id: data.specialist_id,
      firstName: data.firstName,
      lastName: data.lastName,
    };

    const userUpdateResult = await Meteor.users.updateAsync(userId, {
      $set: updateFields
    });

    if (wasSpecialist && !isNowSpecialist) {
      // Role changed from specialist to something else, remove from SpecialistsCollection
      await SpecialistsCollection.removeAsync({ userId });
    } else if (isNowSpecialist) {
      const specialist = await SpecialistsCollection.findOneAsync({ userId });
      if (specialist) {
        await SpecialistsCollection.updateAsync(
          { userId },
          {
            $set: {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email
            }
          }
        );
      } else {
        await SpecialistsCollection.insertAsync({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          userId: userId,
          createdAt: new Date()
        });
      }
    }

    return userUpdateResult;
  }
});
