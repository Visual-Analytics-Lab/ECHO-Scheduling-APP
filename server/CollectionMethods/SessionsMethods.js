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

  // Export sessions for the current user
  async exportMySessionsExcel() {
    const userId = Meteor.userId();
    if (!userId) throw new Meteor.Error("unauthorized", "You must be logged in");

    const user = await Meteor.users.findOneAsync(userId);
    const specialistIds = user?.specialist_id || [];

    const matchCriteria = {
      dateTime: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      $or: [
        { presentingSpecialist: { $in: specialistIds } },
        { supportingSpecialist1: { $in: specialistIds } },
        { supportingSpecialist2: { $in: specialistIds } },
        { facilitator: userId },
        { supportingFacilitator: userId }
      ]
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
            $concat: [
              { $arrayElemAt: ["$presentingSpecialistDetails.firstName", 0] },
              " ",
              { $arrayElemAt: ["$presentingSpecialistDetails.lastName", 0] }
            ]
          },
          supportingSpecialist1: {
            $concat: [
              { $arrayElemAt: ["$supportingSpecialist1Details.firstName", 0] },
              " ",
              { $arrayElemAt: ["$supportingSpecialist1Details.lastName", 0] }
            ]
          },
          supportingSpecialist2: {
            $concat: [
              { $arrayElemAt: ["$supportingSpecialist2Details.firstName", 0] },
              " ",
              { $arrayElemAt: ["$supportingSpecialist2Details.lastName", 0] }
            ]
          },
          facilitator: { $arrayElemAt: ["$facilitatorDetails.username", 0] },
          supportingFacilitator: { $arrayElemAt: ["$supportingFacilitatorDetails.username", 0] },
          topic: { $arrayElemAt: ["$topicDetails.title", 0] },
          participantGroup: { $arrayElemAt: ["$participantGroupDetails.name", 0] }
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
