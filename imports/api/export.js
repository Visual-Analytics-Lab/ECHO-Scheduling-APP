import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Parser } from 'json2csv'

import { SessionsCollection } from './collections'

Meteor.methods({
    async exportCSV(fromDate, toDate) {
      check(fromDate, Date);
      check(toDate, Date);
  
      // Convert dates to strings that match the stored format 
      const startStr = fromDate.toISOString().slice(0, 16);
      const endStr = toDate.toISOString().slice(0, 16);
  
      const data = await SessionsCollection.rawCollection().aggregate([
        {
            $match: {
                dateTime: { $gte: startStr, $lte: endStr }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "facilitator",
                foreignField: "_id",
                as: "facilitatorDetails"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "coordinator",
                foreignField: "_id",
                as: "coordinatorDetails"
            }
        },
        {
            $lookup: {
                from: "specialists",
                localField: "presentingSpecialist",
                foreignField: "_id",
                as: "presentingSpecialistDetails"
            }
        },
        {
            $lookup: {
                from: "specialists",
                localField: "supportingSpecialist1",
                foreignField: "_id",
                as: "supportingSpecialist1Details"
            }
        },
        {
            $lookup: {
                from: "specialists",
                localField: "supportingSpecialist2",
                foreignField: "_id",
                as: "supportingSpecialist2Details"
            }
        },
        {
            $lookup: {
                from: "participantGroups",
                localField: "participantGroup",
                foreignField: "_id",
                as: "participantGroupDetails"
            }
        },
        {
            $lookup: {
                from: "topics",
                localField: "topic",
                foreignField: "_id",
                as: "topicDetails"
            }
        },
        {
            $project: {
              sessionTitle: 1,
              casePresenter: 1,
              facilitator: { $arrayElemAt: ["$facilitatorDetails.username", 0] },
              coordinator: { $arrayElemAt: ["$coordinatorDetails.username", 0] },
              presentingSpecialist: { $arrayElemAt: ["$presentingSpecialistDetails.name", 0] },
              supportingSpecialist1: { $arrayElemAt: ["$supportingSpecialist1Details.name", 0] },
              supportingSpecialist2: { $arrayElemAt: ["$supportingSpecialist2Details.name", 0] },
              participantGroup: { $arrayElemAt: ["$participantGroupDetails.name", 0] },
              dateTime: 1,
              presentationsDue: 1,
              newMaterial: 1,
              color: 1,
              topic: { $arrayElemAt: ["$topicDetails.title", 0] }, 
              notes: 1,
              createdAt: 1
            }
          }
      ]).toArray();
  
      if (!data.length) {
        throw new Meteor.Error('no-data', 'No data for the specified dates');
      }
  
      const fields = [
        "sessionTitle",
        "casePresenter",
        "facilitator",
        "coordinator",
        "presentingSpecialist",
        "supportingSpecialist1",
        "supportingSpecialist2",
        "participantGroup",
        "dateTime",
        "presentationsDue",
        "newMaterial",
        "color",
        "topic",
        "notes",
        "createdAt"
      ];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(data);
      return csv;
    }
  });
  
  