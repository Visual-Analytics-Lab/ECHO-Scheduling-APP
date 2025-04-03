// #region SECTION CONFIG
/*  
*   colName - string used to call meteor collection methods, 
*   colData - fetched data from that collection,
*   tableFields - fields to display in table (parentCollection - used to convert related id to entry name/title), 
*    
*
*   -- Popup Specific -------------
*   popupFields - fields to display in popup (inputType is text by default),
*       - name: key
*       - label: input label
*       - required: Fields checked in collection methods should be true (false by default)
*       - inputType: type of input box
*       - colSpan: How many columns the field input shield span (Max and default = 2)
*   fieldContext - any colData required for listed fields (Ex: series multiselect dropdown needs all the available series) 
*/ 
const getSectionConfig = (collections, colData, rowData) => ({

  Users: {
    collectionName: "users",
    collectionData: colData.users,
    tableFields: () => {
      const fields = [
        { name: "username", label: "Username", type: "text" },
        { name: "email",    label: "Email",    type: "email" },
        { name: "role_id",  label: "Role",     parentCollection: collections.roles },
      ];
      return fields;
    },
    popupFields: () => {
      const fields = [
        { name: "username", label: "Username", required: true },
        { name: "email",    label: "Email",    required: true },
      ];
      // Show roles as long as user isn't editting their own
      if (rowData._id != Meteor.user()._id) 
        fields.push({ name: "role_id", label: "Role", required: true, inputType: "select" });
      // Show password only when using add new user pop up
      if (!rowData._id) 
        fields.push({ name: "password", label: "Password", required: true });
      return fields;
    },
    fieldContext: { role_id: colData.roles },
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
      // fullName will combine firstName and lastName fields into 1 column
      { name: "fullName", label: "Name" },
      { name: "profession", label: "Profession" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone Number" },
      { name: "institute", label: "Institute" },
    ],
    popupFields: () => [
      { name: "firstName",            label: "First Name",     required: true,                            colSpan: 1 },
      { name: "lastName",             label: "Last Name",      required: true,                            colSpan: 1 },
      { name: "email",                label: "Email",          required: true,                            colSpan: 1 },
      { name: "phone",                label: "Phone Number",                                              colSpan: 1 },
      { name: "nameColor",            label: "Name Color",                      inputType: "color",       colSpan: 1 },
      { name: "sessionPreferrence",   label: "Preferred Sessions Per Week",     inputType: "number",      colSpan: 1 },
      { name: "participantGroups_id", label: "Preferred Audience",              inputType: "select"                  },
      { name: "profession",           label: "Profession",                                                colSpan: 1 },
      { name: "institute",            label: "Institute/Employer",                                        colSpan: 1 },
      { name: "topics_ids",           label: "Topics of Expertise",             inputType: "multiSelect"             },
      { name: "areasOfExpertise",     label: "Major Areas of Expertise"                                              },
      // TODO: Add a resume and bio upload somehow
    ],
    fieldContext: { 
      participantGroups_id: colData.participantGroups,
      topics_ids: colData.topics,
    },
  },

  "Participant Groups": {
    collectionName: "participantGroups",
    collectionData: colData.participantGroups,
    tableFields: () => [
      { name: "name",     label: "Name" },
      { name: "agency",   label: "Agency" },
      { name: "email",    label: "Email" },
      { name: "phone",    label: "Phone Number" },
      { name: "famOrPro", label: "Families or Professionals" },
    ],
    popupFields: () => [
      { name: "name",       label: "Name",                      required: true,                           colSpan: 1 },
      { name: "series_ids", label: "Series",                    required: true, inputType: "multiSelect", colSpan: 1 },
      { name: "agency",     label: "Agency",                    required: true,                           colSpan: 1 },
      { name: "email",      label: "Email - Primary Contact",                                             colSpan: 1 },
      { name: "focus",      label: "Focus",                     required: true, inputType: "select",      colSpan: 1 },
      { name: "phone",      label: "Phone Number",                                                        colSpan: 1 },
      { name: "famOrPro",   label: "Families or Professionals", required: true, inputType: "select",      colSpan: 1 },
      { name: "nameColor",  label: "Name Color",                                inputType: "color",       colSpan: 1 },
    ],
    fieldContext: { 
      series_ids: colData.series,
      focus: [
        { _id: "Education", title: "Education" },
        { _id: "Social Work", title: "Social Work" },
      ],
      famOrPro: [
        { _id: "Families", title: "Families" },
        { _id: "Professionals", title: "Professionals" },
      ]
    },
  },

  Semesters: {
    collectionName: "semesters",
    collectionData: colData.semesters,
    tableFields: () => [
      { name: "title",       label: "Title" },
      { name: "series_ids",  label: "Series",  parentCollection: collections.series },
      { name: "startDate",   label: "Start Date"  },
      { name: "endDate",     label: "End Date"    },      
      { name: "description", label: "Description" },
    ],
    popupFields: () => [
      { name: "title",       label: "Title",      required: true                                        },
      { name: "series_ids",  label: "Series",                      inputType: "multiSelect"             },
      { name: "startDate",   label: "Start Date", required: true,  inputType: "dateTime",    colSpan: 1 },
      { name: "endDate",     label: "End Date",   required: true,  inputType: "dateTime",    colSpan: 1 },      
      { name: "description", label: "Description"                                                       },
    ],
    fieldContext: { series_ids: colData.series },
  },

  Series: {
    collectionName: "series",
    collectionData: colData.series,
    tableFields: () => [
      { name: "title",       label: "Title" },
      { name: "startDate",   label: "Start Date" },
      { name: "endDate",     label: "End Date" },
      { name: "description", label: "Description" },
    ],
    popupFields: () => [
      { name: "title",       label: "Title",       required: true,                                     },
      { name: "startDate",   label: "Start Date",  required: true,  inputType: "dateTime",  colSpan: 1 },
      { name: "endDate",     label: "End Date",    required: true,  inputType: "dateTime",  colSpan: 1 },
      { name: "description", label: "Description"                                                      },
    ],
    fieldContext: {},
  },

  // TODO: Specialists aren't being displayed on table properly
  Topics: {
    collectionName: "topics",
    collectionData: colData.topics,
    tableFields: () => [
      { name: "title",           label: "Title" },
      { name: "specialists_ids", label: "Preferred Specialists", parentCollection: collections.specialists },
      { name: "description",     label: "Description" },
    ],
    popupFields: () => [
      { name: "title",           label: "Title", required: true },
      { name: "specialists_ids", label: "Preferred Specialists", inputType: "multiSelect" },
      { name: "description",     label: "Description" },
    ],
    fieldContext: { specialists_ids: colData.specialists },
  },
});

export default getSectionConfig;
// #endregion