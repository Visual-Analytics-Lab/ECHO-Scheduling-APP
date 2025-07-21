import React, { useState, useEffect } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
// Components
import Navbar from "../navbar/Navbar";
import AdminSidebar from "./AdminSidebar";
import AdminTable from "./AdminTable";
import PopupForm from "../popup_form/PopupForm";
// Component Config
import getSectionConfig from "../../../api/adminSectionConfig.js"
// Collections
import {
  SpecialistsCollection,
  ParticipantGroupsCollection,
  SemesterCollection,
  SeriesCollection,
  TopicsCollection,
  RolesCollection,
  CategoriesCollection
} from "../../../api/collections";
// Other
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 


//#region ADMIN PAGE
const Admin = () => {
  const [activeSection, setActiveSection] = useState("Users");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [rowData, setRowData] = useState({});
  const [popupSectionOverride, setPopupSectionOverride] = useState(null);

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
      Meteor.subscribe("categories"),
    ];
    return () => subscriptions.forEach(sub => sub.stop());
  }, []);

  useEffect(() => {
  const handleOpenAddUser = (e) => {
    const userData = e.detail;

    setRowData({
      email: userData.email?.trim().toLowerCase() || '',
    });

    setPopupSectionOverride("Users");
    setIsReadOnly(false);
    setIsPopupOpen(true);
  };


  window.addEventListener("open-add-user-popup", handleOpenAddUser);
  
  return () => {
    window.removeEventListener("open-add-user-popup", handleOpenAddUser);
  };
}, []);


  // Fetch from collections after subscribing
  const users = useTracker(() => 
    Meteor.users.find().fetch().map(user => ({
      _id: user._id,
      username: user.username,
      email: user.emails?.[0]?.address || 'No email', // Email address is structured like email: [address : 'here']
      role_id: user.role_id,
      firstName: user.firstName || user.profile?.firstName || '',
      lastName: user.lastName || '', 
    }))
  );
  //console.log(users);
  const specialists = useTracker(() => SpecialistsCollection.find().fetch());
  const participantGroups = useTracker(() => ParticipantGroupsCollection.find().fetch());
  const semesters = useTracker(() => SemesterCollection.find().fetch());
  const series = useTracker(() => SeriesCollection.find().fetch());
  const topics = useTracker(() => TopicsCollection.find().fetch());
  const roles = useTracker(() => RolesCollection.find().fetch());
  const categories = useTracker(() => CategoriesCollection.find().fetch());
  const collections = { 
    users: Meteor.users, 
    specialists: SpecialistsCollection, 
    participantGroups: ParticipantGroupsCollection, 
    semesters: SemesterCollection, 
    series: SeriesCollection, 
    topics: TopicsCollection, 
    roles: RolesCollection,
    categories: CategoriesCollection
  };
  const colData = { users, specialists, participantGroups, semesters, series, topics, roles, categories};



  // Fetch current section config dynamically
  const sectionConfig = getSectionConfig(collections, colData, rowData);
  const currentSection = sectionConfig[popupSectionOverride || activeSection] || {};

  // Return "(collectionName).(operation)""
  const getMethodName = (operation) => `${currentSection.collectionName}.${operation}`;
  // Populate RowData/FormData then open pop up for editting
  const openEditPopUp = (data) => {
    console.log('Editing row data:', data);
    setRowData(data);
    setIsPopupOpen(true);
    setIsReadOnly(false);
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
  const handleShow = (data) => {
    setRowData(data);
    setIsReadOnly(true);
    setIsPopupOpen(true);
  }
  const sectionDisplayNames = {
    Users: "Users",
    Roles: "Roles",
    Specialists: "Specialists",
    "Participant Groups": "Participant Groups",
    Semesters: "Semesters",
    Series: "Series",
    Topics: "Presentation Titles", 
    Categories: "Categories",
  };

  return (
    <div className="bg-bg-light flex flex-col h-screen">
      <div className="flex flex-1">
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1 p-4">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-echo-maroon border-b-4 border-echo-gold"> {sectionDisplayNames[activeSection] || activeSection}</h1>
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
            fields={currentSection.tableFields() || []}
            onEdit={openEditPopUp}
            onDelete={handleDelete}
            onShow = {handleShow}
          />

          <PopupForm
            isOpen={isPopupOpen}
            setIsOpen={(val) => {
              if (!val) {
                setPopupSectionOverride(null);
              }
              setIsPopupOpen(val);
            }}
            collection={currentSection.collectionName || ""}
            formData={rowData}
            setFormData={setRowData}
            fields={currentSection.popupFields() || []}
            fieldData={currentSection.fieldContext}
            title={getPopUpTitle()}
            alertSuccess={(action) => {
              toast.success(`Item successfully ${action}!`);
              setPopupSectionOverride(null);
            }}
            isReadOnly={isReadOnly}
          />
        </main>
      </div>
    </div>
  );
};

export default Admin;
//#endregion