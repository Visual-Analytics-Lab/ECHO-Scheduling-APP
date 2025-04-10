import React, { useState, useEffect } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import Navbar from "../navbar/Navbar";
import AdminSidebar from "./AdminSidebar";
import AdminTable from "./AdminTable";
import {
  SpecialistsCollection,
  ParticipantGroupsCollection,
  SemesterCollection,
  SeriesCollection,
  TopicsCollection,
  RolesCollection
} from "../../../api/collections";
import PopupForm from "../popup_form/PopupForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 


/*  
*   colName - string used to call meteor collection methods, 
*   colData - fetched data from that collection,
*   fields - fields to display in table/popup, 
*   fieldContext - any colData required for listed fields (Ex: series multiselect dropdown needs all the available series) 
*/ 
const getSectionConfig = (users, specialists, participantGroups, semesters, series, topics, roles, rowData) => ({
  Users: {
    collectionName: "users",
    collectionData: users,
    fields: (component) => {
      const fields = [
        { name: "username", label: "Username", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "role", label: "Role", inputType: "multiSelect", parentCollection: RolesCollection},
      ];
      // Show password only when using add new user pop up
      if (!rowData._id && component == "popup") {
        fields.push({ name: "password", label: "Password", type: "password" });
      }
      return fields;
    },
    fieldContext: { role: roles },
  },
  Roles: {
    collectionName: "roles",
    collectionData: roles,
    fields: () => [
      {name: "role", label: "Role"},
      {name: "desc", label: "Description"},
    ],
    fieldContext: {},
  },
  Specialists: {
    collectionName: "specialists",
    collectionData: specialists,
    fields: () => [
      { name: "name", label: "Name" },
      { name: "speciality", label: "Specialty" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "institute", label: "Institute" },
    ],
    fieldContext: {},
  },
  "Participant Groups": {
    collectionName: "participantGroups",
    collectionData: participantGroups,
    fields: () => [
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
    collectionData: semesters,
    fields: () => [
      { name: "title", label: "Title" },
      { name: "description", label: "Description" },
      { name: "startDate", label: "Start Date" },
      { name: "endDate", label: "End Date" },
      { name: "series_ids", label: "Series", inputType: "multiSelect", parentCollection: SeriesCollection },
    ],
    fieldContext: { series_ids: series },
  },
  Series: {
    collectionName: "series",
    collectionData: series,
    fields: () => [
      { name: "title", label: "Title" },
      { name: "description", label: "Description" },
      { name: "startDate", label: "Start Date" },
      { name: "endDate", label: "End Date" },
    ],
    fieldContext: {},
  },
  Topics: {
    collectionName: "topics",
    collectionData: topics,
    fields: () => [
      { name: "title", label: "Title" },
      { name: "specialists_ids", label: "Preferred Specialists", inputType: "multiSelect", parentCollection: SpecialistsCollection },
      { name: "description", label: "Description" },
    ],
    fieldContext: { specialists_ids: specialists },
  },
});

const Admin = () => {
  const [activeSection, setActiveSection] = useState("Users");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [rowData, setRowData] = useState({});

  // Subscribe to collections
  useEffect(() => {

    const subscriptions = [
      Meteor.subscribe("users"),
      Meteor.subscribe("specialists"),
      Meteor.subscribe("participantGroups"),
      Meteor.subscribe("semesters"),
      Meteor.subscribe("series"),
      Meteor.subscribe("topics"),
      Meteor.subscribe("roles"),
    ];

    return () => subscriptions.forEach(sub => sub.stop());
  }, []);

  // Fetch from collections after subscribing
  const users = useTracker(() => 
    Meteor.users.find().fetch().map(user => ({
      _id: user._id,
      username: user.username,
      email: user.emails?.[0]?.address || 'No email',
      role: user.role
    }))
  );
  //console.log(users);
  const specialists = useTracker(() => SpecialistsCollection.find().fetch());
  const participantGroups = useTracker(() => ParticipantGroupsCollection.find().fetch());
  const semesters = useTracker(() => SemesterCollection.find().fetch());
  const series = useTracker(() => SeriesCollection.find().fetch());
  const topics = useTracker(() => TopicsCollection.find().fetch());
  const roles = useTracker(() => RolesCollection.find().fetch());


  // Fetch current section config dynamically
  const sectionConfig = getSectionConfig(users, specialists, participantGroups, semesters, series, topics, roles, rowData);
  const currentSection = sectionConfig[activeSection] || {};

  // Return "(collectionName).(operation)""
  const getMethodName = (operation) => `${currentSection.collectionName}.${operation}`;
  // Populate RowData/FormData then open pop up for editting
  const openEditPopUp = (data) => {
    setRowData(data);
    setIsPopupOpen(true);
  }  

  const handleDelete = async (id) => {
    try {
      const methodName = getMethodName('remove');
      await Meteor.call(methodName, id);

      toast.success("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(error.reason || "Failed to delete item. Please try again.");
    }
  };

  const getPopUpTitle = () =>
  {
    const start = rowData._id ? 'Edit' : 'Add New'
    // Add any active selections into the array that are the same plural and singular
    return activeSection && ['Series'].includes(activeSection) 
      ? `${start} ${activeSection}` 
      : `${start} ${activeSection.slice(0, -1)}`
  }

  return (
    <div className="bg-bg-light flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1 p-4">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-echo-maroon">{activeSection}</h1>
            <button
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
              onClick={() => setIsPopupOpen(true)}
            >
              + Add New
            </button>
          </header>

          <AdminTable
            data={currentSection.collectionData}
            sectionTitle={activeSection}
            fields={currentSection.fields() || []}
            onEdit={openEditPopUp}
            onDelete={handleDelete}
          />

          <PopupForm
            isOpen={isPopupOpen}
            setIsOpen={setIsPopupOpen}
            collection={currentSection.collectionName || ""}
            formData={rowData}
            setFormData={setRowData}
            fields={currentSection.fields("popup") || []}
            fieldData={currentSection.fieldContext}
            title={getPopUpTitle()}
            alertSuccess={(action) => { toast.success(`Item successfully ${action}!`); }}
          />
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Admin;
