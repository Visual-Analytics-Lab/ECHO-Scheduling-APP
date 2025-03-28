// #region SECTION CONFIG
/*  
*   colName - string used to call meteor collection methods, 
*   colData - fetched data from that collection,
*   tableFields - fields to display in table (parentCollection - used to convert related id to entry name/title), 
*    
*
*   -- Popup Specific -------------
*   popupFields - fields to display in popup (inputType is text by default),
*   fieldContext - any colData required for listed fields (Ex: series multiselect dropdown needs all the available series) 
*   colSpan - How many columns the field input shield span (Max and default = 2)
*/ 
const getSectionConfig = (collections, colData, rowData) => ({

  Users: {
    collectionName: "users",
    collectionData: colData.users,
    tableFields: () => {
      const fields = [
        { name: "username", label: "Username", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "role_id", label: "Role", parentCollection: collections.roles},
      ];
      return fields;
    },
    popupFields: () => {
      const fields = [
        { name: "username", label: "Username", type: "text"},
        { name: "email", label: "Email", type: "email"},
      ];
      // Show roles as long as user isn't editting their own
      if (rowData._id != Meteor.user()._id) 
        fields.push({ name: "role_id", label: "Role", inputType: "select"});
      // Show password only when using add new user pop up
      if (!rowData._id) 
        fields.push({ name: "password", label: "Password", type: "password"});
      return fields;
    },
    fieldContext: { role_id: colData.roles},
  },

  Roles: {
    collectionName: "roles",
    collectionData: colData.roles,
    tableFields: () => [
      {name: "title", label: "Role"},
      {name: "desc", label: "Description"},
    ],
    popupFields: () => [
      {name: "title", label: "Role"},
      {name: "desc", label: "Description"},
    ],
    fieldContext: {},
  },

  Specialists: {
    collectionName: "specialists",
    collectionData: colData.specialists,
    tableFields: () => [
      { name: "name", label: "Name" },
      { name: "specialty", label: "Specialty" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "institute", label: "Institute" },
    ],
    // TODO: edit collection methods to accept these
    // TODO: Finish changing these fields
    popupFields: () => [
      { name: "firstName", label: "First Name", colSpan: 1 },
      { name: "dob", label: "Date of Birth", colSpan: 1 },
      { name: "lastName", label: "Last Name", colSpan: 1 },
      // TODO Make color picker here
      { name: "lastName", label: "Last Name", colSpan: 1 },
      { name: "email", label: "Email", colSpan: 1 },
      { name: "participantGroups_id", label: "Preferred Audience", inputType: "select", colSpan: 1 },
      { name: "specialty", label: "Specialty" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "institute", label: "Institute" },
    ],
    fieldContext: { participantGroups_ids: colData.participantGroups},
  },
  "Participant Groups": {
    collectionName: "participantGroups",
    collectionData: colData.participantGroups,
    tableFields: () => [
      { name: "name", label: "Name" },
      { name: "agency", label: "Agency" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "families", label: "Families" },
    ],
    popupFields: () => [
      { name: "name", label: "Name" },
      { name: "agency", label: "Agency" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "families", label: "Families" },
    ],
    fieldContext: {},
  },

  Semesters: {
    collectionName: "semesters",
    collectionData: colData.semesters,
    tableFields: () => [
      { name: "title", label: "Title" },
      { name: "description", label: "Description" },
      { name: "startDate", label: "Start Date" },
      { name: "endDate", label: "End Date" },
      { name: "series_ids", label: "Series", parentCollection: collections.series },
    ],
    popupFields: () => [
      { name: "title", label: "Title" },
      { name: "description", label: "Description" },
      { name: "startDate", label: "Start Date" },
      { name: "endDate", label: "End Date" },
      { name: "series_ids", label: "Series", inputType: "multiSelect" },
    ],
    fieldContext: { series_ids: colData.series },
  },

  Series: {
    collectionName: "series",
    collectionData: colData.series,
    tableFields: () => [
      { name: "title", label: "Title" },
      { name: "description", label: "Description" },
      { name: "startDate", label: "Start Date" },
      { name: "endDate", label: "End Date" },
    ],
    popupFields: () => [
      { name: "title", label: "Title" },
      { name: "description", label: "Description" },
      { name: "startDate", label: "Start Date" },
      { name: "endDate", label: "End Date" },
    ],
    fieldContext: {},
  },

  Topics: {
    collectionName: "topics",
    collectionData: colData.topics,
    tableFields: () => [
      { name: "title", label: "Title" },
      { name: "specialists_ids", label: "Preferred Specialists", parentCollection: collections.specialists },
      { name: "description", label: "Description" },
    ],
    popupFields: () => [
      { name: "title", label: "Title" },
      { name: "specialists_ids", label: "Preferred Specialists", inputType: "multiSelect" },
      { name: "description", label: "Description" },
    ],
    fieldContext: { specialists_ids: colData.specialists },
  },
});

export default getSectionConfig;
// #endregion