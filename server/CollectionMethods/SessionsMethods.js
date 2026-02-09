import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SessionsCollection } from '../../imports/api/collections';
import ExcelJS from 'exceljs';

// Insert a new session
Meteor.methods({
  async 'sessions.insert'(data) {
    check(data, Match.ObjectIncluding({
      sessionTitle: String,
      dateTime: Date,
      // Extend validation as needed
    }));

    const sessionsId = await SessionsCollection.insertAsync({
      ...data,
      createdAt: new Date(),
    });
    return sessionsId;
  },

  // Remove a session by ID
  async 'sessions.remove'(sessionsId) {
    check(sessionsId, String);
    return await SessionsCollection.removeAsync(sessionsId);
  },

  // Remove all sessions in a recurring group
  async 'sessions.removeRecurringGroup'(recurringGroupId) {
    check(recurringGroupId, String);
    const result = await SessionsCollection.removeAsync({ recurringGroupId });
    return result;
  },

  // Update a session
  async 'sessions.update'(sessionsId, data) {
    check(sessionsId, String);
    check(data, Match.ObjectIncluding({
      sessionTitle: String,
      dateTime: Date,
      // Extend validation as needed
    }));
    return await SessionsCollection.updateAsync(sessionsId, {
      $set: data
    });
  },

  // Update all sessions in a recurring group
  async 'sessions.updateRecurringGroup'(recurringGroupId, data) {
    check(recurringGroupId, String);
    check(data, Object);
    
    // Remove dateTime and presentationsDue from group updates as they should be unique per session
    const { dateTime, presentationsDue, ...updateData } = data;
    
    return await SessionsCollection.updateAsync(
      { recurringGroupId },
      { $set: updateData },
      { multi: true }
    );
  },

  // Export sessions for the current user
  async exportMySessionsExcel() {
  const userId = Meteor.userId();
  if (!userId) throw new Meteor.Error("unauthorized", "You must be logged in");

  const user = await Meteor.users.findOneAsync(userId);
  const userEmail = user?.emails?.[0]?.address;

  // 1. Find the specialist profile that matches the user's email
  let userSpecialistId = null;
  if (userEmail) {
    const specialistProfile = await SpecialistsCollection.findOneAsync({ email: userEmail });
    userSpecialistId = specialistProfile?._id || null;
  }

  // 2. Build the match criteria
  const $or = [];
  
  // Always include facilitator roles (using user ID)
  $or.push(
    { facilitator: userId },
    { supportingFacilitator: userId }
  );
  
  // If we found a specialist profile, also include specialist roles
  if (userSpecialistId) {
    $or.push(
      { presentingSpecialist: userSpecialistId },
      { supportingSpecialist1: userSpecialistId },
      { supportingSpecialist2: userSpecialistId }
    );
  }

  // If no criteria was built (shouldn't happen but safe)
  if ($or.length === 0) {
    throw new Meteor.Error("no-data", "No sessions found. You don't have a specialist profile or facilitator role.");
  }

  const matchCriteria = {
    dateTime: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    $or: $or
  };

  const data = await SessionsCollection.rawCollection().aggregate([
    { $match: matchCriteria },
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
        from: "users",
        localField: "facilitator",
        foreignField: "_id",
        as: "facilitatorDetails"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "supportingFacilitator",
        foreignField: "_id",
        as: "supportingFacilitatorDetails"
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
      $lookup: {
        from: "participantGroups",
        localField: "participantGroup",
        foreignField: "_id",
        as: "participantGroupDetails"
      }
    },
    {
      $project: {
        sessionTitle: 1,
        dateTime: 1,
        notes: 1,
        presentingSpecialist: {
          $ifNull: [
            {
              $concat: [
                { $arrayElemAt: ["$presentingSpecialistDetails.firstName", 0] },
                " ",
                { $arrayElemAt: ["$presentingSpecialistDetails.lastName", 0] }
              ]
            },
            "Not assigned"
          ]
        },
        supportingSpecialist1: {
          $ifNull: [
            {
              $concat: [
                { $arrayElemAt: ["$supportingSpecialist1Details.firstName", 0] },
                " ",
                { $arrayElemAt: ["$supportingSpecialist1Details.lastName", 0] }
              ]
            },
            "Not assigned"
          ]
        },
        supportingSpecialist2: {
          $ifNull: [
            {
              $concat: [
                { $arrayElemAt: ["$supportingSpecialist2Details.firstName", 0] },
                " ",
                { $arrayElemAt: ["$supportingSpecialist2Details.lastName", 0] }
              ]
            },
            "Not assigned"
          ]
        },
        facilitator: { 
          $ifNull: [
            { $arrayElemAt: ["$facilitatorDetails.username", 0] },
            "Not assigned"
          ]
        },
        supportingFacilitator: { 
          $ifNull: [
            { $arrayElemAt: ["$supportingFacilitatorDetails.username", 0] },
            "Not assigned"
          ]
        },
        topic: { 
          $ifNull: [
            { $arrayElemAt: ["$topicDetails.title", 0] },
            "Not assigned"
          ]
        },
        participantGroup: { 
          $ifNull: [
            { $arrayElemAt: ["$participantGroupDetails.name", 0] },
            "Not assigned"
          ]
        }
      }
    },
    { $sort: { dateTime: 1 } }
  ]).toArray();

  if (!data.length) {
    throw new Meteor.Error("no-data", "No sessions found.");
  }

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("My Sessions");

  ws.columns = [
    { header: "Session Title", key: "sessionTitle", width: 25 },
    { header: "Date Time", key: "dateTime", width: 25 },
    { header: "Presenting Specialist", key: "presentingSpecialist", width: 25 },
    { header: "Support 1", key: "supportingSpecialist1", width: 25 },
    { header: "Support 2", key: "supportingSpecialist2", width: 25 },
    { header: "Facilitator", key: "facilitator", width: 20 },
    { header: "Supporting Facilitator", key: "supportingFacilitator", width: 20 },
    { header: "Topic", key: "topic", width: 20 },
    { header: "Participant Group", key: "participantGroup", width: 20 },
    { header: "Notes", key: "notes", width: 30 }
  ];

  data.forEach(session => {
    ws.addRow({
      ...session,
      dateTime: formatDate(session.dateTime),
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer).toString("base64");
}
});