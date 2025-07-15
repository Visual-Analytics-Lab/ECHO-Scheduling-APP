import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SpecialistsCollection, CategoriesCollection } from '../../imports/api/collections';

Meteor.methods({ 
    async 'categories.insert'(data) {
        //console.log('Received data:', data);
        check(data, Match.ObjectIncluding({
            title: String,
        }));
        
        const categoriesId = await CategoriesCollection.insertAsync({
            ...data,
            createdAt: new Date(),
        });
        //console.log('Inserted specialist with ID:', categoriesId);
        return categoriesId;
    },
    async 'categories.remove'(categoryId) {
        check(categoryId, String);

        const category = await CategoriesCollection.findOneAsync(categoryId);
        if (!category) {
        throw new Meteor.Error('not-found', 'Category not found');
        }

        // Remove the category document
        const result = await CategoriesCollection.removeAsync(categoryId);

        if (result) {
        // Remove the deleted categoryId from all specialists' categories_ids array
        await SpecialistsCollection.updateAsync(
            { categories_ids: categoryId },
            { $pull: { categories_ids: categoryId } },
            { multi: true }
        );
        }

        return result;
    },
    async 'categories.update'(categoriesId, data) {
        check(categoriesId, String);
        check(data, Match.ObjectIncluding({
            title: String,
        }));
        return await CategoriesCollection.updateAsync(categoriesId, {
            $set: data
        });
    }
});