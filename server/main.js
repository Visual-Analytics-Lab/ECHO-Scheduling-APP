import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

if (Meteor.isServer) {
  process.env.MONGO_URL="mongodb://127.0.0.1:27017/Echo-Database"
  Meteor.startup(async () => {
    try {
      const user = await Meteor.users.findOneAsync({ username: 'testuser' });

      if (!user) {
        Accounts.createUser({
          username: 'testuser',
          email: 'test@example.com',
          password: 'testpassword',
        });
        console.log('Test user created');
      } else {
        console.log('Test user already exists');
      }
    } catch (error) {
      console.error('Error checking or creating user:', error);
    }
  });
}
