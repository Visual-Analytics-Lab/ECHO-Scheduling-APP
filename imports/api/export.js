import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import ExcelJS from 'exceljs';
import { SessionsCollection } from './collections';

Meteor.methods({
  async exportExcelByOption(option, fromDate, toDate) {
    check(option, String);
    check(fromDate, Match.OneOf(Date, null));
    check(toDate, Match.OneOf(Date, null));

    console.log(`Export request: ${option}`);
    console.log(`Date range: ${fromDate} to ${toDate}`);

    let matchCriteria = {};
    
    if (fromDate && toDate) {
      const startStr = new Date(fromDate.toISOString().slice(0, 16));
      const endStr = new Date(toDate.toISOString().slice(0, 16));
      matchCriteria.dateTime = { $gte: startStr, $lte: endStr };
      console.log(`Filtering by date range: ${startStr} to ${endStr}`);
    } else {
      console.log('No date filtering applied - getting all sessions');
    }

    const data = await SessionsCollection.rawCollection().aggregate([
      { 
        $match: matchCriteria
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
        $lookup: {
          from: "topics",
          localField: "presentationTitle",
          foreignField: "_id",
          as: "presentationTitleDetails"
        }
      },
      {
        $lookup: {
          from: "topics",
          localField: "topicSimple",
          foreignField: "_id",
          as: "topicSimpleDetails"
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      {
        $lookup: {
          from: "semesters",
          localField: "semester",
          foreignField: "_id",
          as: "semesterDetails"
        }
      },
      {
        $lookup: {
          from: "series",
          localField: "series",
          foreignField: "_id",
          as: "seriesDetails"
        }
      },
      {
        $project: {
          sessionNumber: 1,
          sessionTitle: 1,
          casePresenter: 1,
          facilitator: { $arrayElemAt: ["$facilitatorDetails.username", 0] },
          supportingFacilitator: { $arrayElemAt: ["$supportingFacilitatorDetails.username", 0] },
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
          participantGroup: { $arrayElemAt: ["$participantGroupDetails.name", 0] },
          participantGroupFocus: { $arrayElemAt: ["$participantGroupDetails.focus", 0] },
          dateTime: 1,
          presentationsDue: 1,
          newMaterial: 1,
          color: 1,
          topic: { $arrayElemAt: ["$topicDetails.title", 0] },
          presentationTitle: { $arrayElemAt: ["$presentationTitleDetails.title", 0] },
          topicSimple: { $arrayElemAt: ["$topicSimpleDetails.title", 0] },
          category: { $arrayElemAt: ["$categoryDetails.title", 0] },
          categoryFocus: { $arrayElemAt: ["$categoryDetails.focus", 0] },
          notes: 1,
          createdAt: 1,
          semester: { $arrayElemAt: ["$semesterDetails.title", 0] },
          series: { $arrayElemAt: ["$seriesDetails.title", 0] }
        }
      },
      {
        $sort: { dateTime: 1 }
      }      
    ]).toArray();

    console.log(`Found ${data.length} sessions`);

    if (!data.length) {
      throw new Meteor.Error('no-data', 'No data found for the specified criteria');
    }

    const formatDateTime = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    const workbook = new ExcelJS.Workbook();

    const addSessionRows = (worksheet, sessions) => {
      worksheet.columns = [
        { header: "Session Title", key: "sessionTitle", width: 25 },
        { header: "Case Presenter", key: "casePresenter", width: 20 },
        { header: "Lead Facilitator", key: "facilitator", width: 20 },
        { header: "Supporting Facilitator", key: "supportingFacilitator", width: 20 },
        { header: "Presenting Specialist", key: "presentingSpecialist", width: 25 },
        { header: "Supporting Specialist 1", key: "supportingSpecialist1", width: 25 },
        { header: "Supporting Specialist 2", key: "supportingSpecialist2", width: 25 },
        { header: "Participant Group", key: "participantGroup", width: 20 },
        { header: "Date Time", key: "dateTime", width: 25, style: { numFmt: "mm/dd/yyyy hh:mm AM/PM" }},
        { header: "Presentations Due", key: "presentationsDue", width: 25, style: { numFmt: "mm/dd/yyyy hh:mm AM/PM" }},
        { header: "New Material", key: "newMaterial", width: 15 },
        { header: "Color", key: "color", width: 15 },
        { header: "Topic", key: "topic", width: 20 },
        { header: "Notes", key: "notes", width: 30 },
        { header: "Semester", key: "semester", width: 20 },
        { header: "Series", key: "series", width: 20 },
        { header: "Created At", key: "createdAt", width: 25, style: { numFmt: "mm/dd/yyyy hh:mm AM/PM" }}
      ];
      
      sessions.forEach(session => {
        const formattedSession = {
          ...session,
          dateTime: formatDateTime(session.dateTime),
          presentationsDue: formatDateTime(session.presentationsDue),
          createdAt: formatDateTime(session.createdAt)
        };
        worksheet.addRow(formattedSession);
      });
    };

    switch (option) {
      case "Schedules by Week": {
        const ws = workbook.addWorksheet("Schedules by Week");
        addSessionRows(ws, data);
        break;
      }
      case "Schedules by Participant Groups": {
        const groups = {};
        data.forEach(session => {
          const group = session.participantGroup || "Unknown";
          groups[group] = groups[group] || [];
          groups[group].push(session);
        });
        Object.keys(groups).forEach(group => {
          const ws = workbook.addWorksheet(`Group ${group}`.substring(0, 31));
          addSessionRows(ws, groups[group]);
        });
        break;
      }
      case "Participant Groups by Semester": {
        const groups = {};
        data.forEach(session => {
          const semester = session.semester || "Unknown Semester";
          groups[semester] = groups[semester] || [];
          groups[semester].push(session);
        });
        Object.keys(groups).forEach(semester => {
          const ws = workbook.addWorksheet(`Semester ${semester}`.substring(0, 31));
          addSessionRows(ws, groups[semester]);
        });
        break;
      }
      case "Specialists by Semester": {
        console.log('Processing Specialists by Semester...');
        const groups = {};
        data.forEach((session, index) => {
          console.log(`Processing session ${index + 1}/${data.length}: ${session.sessionTitle}`);
          const semester = session.semester || "Unknown Semester";
          groups[semester] = groups[semester] || [];
          groups[semester].push({
            sessionTitle: session.sessionTitle,
            dateTime: formatDateTime(session.dateTime),
            presentingSpecialist: session.presentingSpecialist || 'Not assigned',
            supportingSpecialist1: session.supportingSpecialist1 || 'Not assigned',
            supportingSpecialist2: session.supportingSpecialist2 || 'Not assigned'
          });
        });
        
        Object.keys(groups).forEach(semester => {
          console.log(`Creating worksheet for semester: ${semester} with ${groups[semester].length} sessions`);
          const ws = workbook.addWorksheet(`Specialists ${semester}`.substring(0, 31));
          ws.columns = [
            { header: "Session Title", key: "sessionTitle", width: 25 },
            { header: "Date Time", key: "dateTime", width: 25, style: { numFmt: "mm/dd/yyyy hh:mm AM/PM" }},
            { header: "Presenting Specialist", key: "presentingSpecialist", width: 25 },
            { header: "Supporting Specialist 1", key: "supportingSpecialist1", width: 25 },
            { header: "Supporting Specialist 2", key: "supportingSpecialist2", width: 25 }
          ];
          groups[semester].forEach(row => ws.addRow(row));
        });
        break;
      }
      case "Presentation Title, Topic, Category": {
        console.log('Processing Presentation Title, Topic, Category...');
        const ws = workbook.addWorksheet("Presentation Details");
        ws.columns = [
          { header: "Date Time", key: "dateTime", width: 25 },
          { header: "Session #", key: "sessionNumber", width: 12 },
          { header: "Presentation Title", key: "presentationTitle", width: 30 },
          { header: "Presenting Specialist", key: "presentingSpecialist", width: 25 },
          { header: "Topic", key: "topicSimple", width: 30 },
          { header: "Category", key: "category", width: 20 },
          { header: "Category Focus", key: "categoryFocus", width: 20 },
          { header: "Participant Group Focus", key: "focus", width: 25 }
        ];
        
        data.forEach(session => {
          ws.addRow({
            dateTime: formatDateTime(session.dateTime),
            sessionNumber: session.sessionNumber || '',
            presentationTitle: session.presentationTitle || session.topic || '',
            presentingSpecialist: session.presentingSpecialist || 'Not assigned',
            topicSimple: session.topicSimple || '',
            category: session.category || '',
            categoryFocus: session.categoryFocus || '',
            focus: session.participantGroupFocus || ''
          });
        });
        break;
      }
      case "Topics by Semester": {
        const groups = {};
        data.forEach(session => {
          const semester = session.semester || "Unknown Semester";
          groups[semester] = groups[semester] || [];
          groups[semester].push({
            sessionTitle: session.sessionTitle,
            dateTime: formatDateTime(session.dateTime),
            topic: session.topic || 'No topic assigned'
          });
        });
        Object.keys(groups).forEach(semester => {
          const ws = workbook.addWorksheet(`Topics ${semester}`.substring(0, 31));
          ws.columns = [
            { header: "Session Title", key: "sessionTitle", width: 25 },
            { header: "Date Time", key: "dateTime", width: 25, style: { numFmt: "mm/dd/yyyy hh:mm AM/PM" }},
            { header: "Topic", key: "topic", width: 25 }
          ];
          groups[semester].forEach(row => ws.addRow(row));
        });
        break;
      }
      case "Semesters by Agency": {
        const agencyGroups = {};
        data.forEach(session => {
          const agency = session.agency || "Unknown Agency";
          const semester = session.semester || "Unknown Semester";
          agencyGroups[agency] = agencyGroups[agency] || {};
          agencyGroups[agency][semester] = agencyGroups[agency][semester] || [];
          agencyGroups[agency][semester].push(session);
        });
        Object.keys(agencyGroups).forEach(agency => {
          const ws = workbook.addWorksheet(`Agency ${agency}`.substring(0, 31));
          Object.keys(agencyGroups[agency]).forEach(semester => {
            ws.addRow([`Semester: ${semester}`]);
            ws.addRow([
              "Session Title",
              "Case Presenter",
              "Lead Facilitator",
              "Supporting Facilitator",
              "Presenting Specialist",
              "Supporting Specialist 1",
              "Supporting Specialist 2",
              "Participant Group",
              "Date Time",
              "Presentations Due",
              "New Material",
              "Color",
              "Topic",
              "Notes",
              "Semester",
              "Series",
              "Created At"
            ]);
            agencyGroups[agency][semester].forEach(session => {
              ws.addRow([
                session.sessionTitle,
                session.casePresenter,
                session.facilitator,
                session.supportingFacilitator,
                session.presentingSpecialist,
                session.supportingSpecialist1,
                session.supportingSpecialist2,
                session.participantGroup,
                formatDateTime(session.dateTime),
                formatDateTime(session.presentationsDue),
                session.newMaterial,
                session.color,
                session.topic,
                session.notes,
                session.semester,
                session.series,
                formatDateTime(session.createdAt)
              ]);
            });
            ws.addRow([]);
          });
        });
        break;
      }
      case "Topics by Participant Groups": {
        const groupTopic = {};
        data.forEach(session => {
          const group = session.participantGroup || "Unknown";
          const topic = session.topic || "Unknown Topic";
          groupTopic[group] = groupTopic[group] || {};
          groupTopic[group][topic] = groupTopic[group][topic] || [];
          groupTopic[group][topic].push(session);
        });
        Object.keys(groupTopic).forEach(group => {
          const ws = workbook.addWorksheet(`Group ${group}`.substring(0, 31));
          Object.keys(groupTopic[group]).forEach(topic => {
            ws.addRow([`Topic: ${topic}`]);
            ws.addRow(["Session Title", "Date Time"]);
            groupTopic[group][topic].forEach(session => {
              ws.addRow([session.sessionTitle, formatDateTime(session.dateTime)]);
            });
            ws.addRow([]);
          });
        });
        break;
      }
      default:
        throw new Meteor.Error("invalid-option", "Invalid print option");
    }

    console.log('Export completed successfully');
    
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer.toString("base64");
  }
});