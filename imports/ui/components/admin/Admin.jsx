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

const Admin = () => {
  const [activeSection, setActiveSection] = useState("Users");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  //Subscribing to Collections
  useEffect(() => {
    const sub0 = Meteor.subscribe("users");
    const sub1 = Meteor.subscribe("specialists");
    const sub2 = Meteor.subscribe("participantGroups");
    const sub3 = Meteor.subscribe("semesters");
    const sub4 = Meteor.subscribe("series");
    const sub5 = Meteor.subscribe("topics");
    const sub6 = Meteor.subscribe("roles");

    return () => {
      sub0.stop();
      sub1.stop();
      sub2.stop();
      sub3.stop();
      sub4.stop();
      sub5.stop();
      sub6.stop();
    };
  }, []);
  const users = useTracker(() => 
    Meteor.users.find().fetch().map(user => ({
      _id: user._id,
      username: user.username,
      email: user.emails?.[0]?.address || 'No email' // Email address is structured like email: [address : 'here']
    }))
  );
  const specialists = useTracker(() => SpecialistsCollection.find().fetch());
  const participantGroups = useTracker(() =>
    ParticipantGroupsCollection.find().fetch()
  );
  const semesters = useTracker(() =>
    SemesterCollection.find().fetch()
  );
  const series = useTracker(() =>
    SeriesCollection.find().fetch()
  );
  const topics = useTracker(() => TopicsCollection.find().fetch());
  const roles = useTracker(() => RolesCollection.find().fetch());

  //Getting Fields for showing data as well as used for pop ups(except users)
  const getFieldsForSection = () => {
    switch (activeSection) {
      case "Users":
        return [
          { name: "username", label: "User Name" },
          { name: "email", label: "Email" },
          { name: "role", label: "Role" },
        ];
      case "Roles":
        return [
          {name: "role", label: "Role"},
          {name: "desc", label: "Description"},
        ];
      case "Specialists":
        return [
          { name: "name", label: "Name" },
          { name: "speciality", label: "Specialty" },
          { name: "email", label: "Email" },
          { name: "phone", label: "Phone" },
          { name: "institute", label: "Institute" },
        ];
      case "Participant Groups":
        return [
          { name: "name", label: "Name" },
          { name: "agency", label: "Agency" },
          { name: "email", label: "Email" },
          { name: "phone", label: "Phone" },
          { name: "families", label: "Families" },
        ];
      case "Semesters":
        return [
          { name: "title", label: "Title" },
          { name: "description", label: "Description" },
          { name: "startDate", label: "Start Date" },
          { name: "endDate", label: "End Date" },
        ];
      case "Series":
        return [
          { name: "title", label: "Title" },
          { name: "description", label: "Description" },
          { name: "series", label: "Series" },
        ];
      case "Topics":
        return [
          { name: "title", label: "Title" },
          { name: "description", label: "Description" },
          { name: "category", label: "Category" },
        ];
      default:
        return [];
    }
  };
  //Exception here because don't show password, but have password field when pop up
  const getUserFormFields = () => {
    return [
      { name: "username", label: "Username", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "role", label: "Role", type: "text" },
      { name: "password", label: "Password", type: "password" }
    ];
  };
  const getCollectionName = () => {
    switch(activeSection) {
      case 'Users': return 'users';
      case 'Roles': return 'roles';
      case 'Specialists': return 'specialists';
      case 'Participant Groups': return 'participantGroups';
      case 'Semesters': return 'semesters';
      case 'Series': return 'series';
      case 'Topics': return 'topics';
      default: return '';
    }
  };
  const getMethodName = (operation) => {
    //const section = activeSection.charAt(0).toLowerCase() + activeSection.slice(1).replace(/\s+/g, '');
    const section = getCollectionName();
    return `${section}.${operation}`;
  };

  const handleEdit = async (id, updatedData) => {
    try {
      const methodName = getMethodName('update');
      await Meteor.call(methodName, id, updatedData);

      toast.success("Item updated successfully!");
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(error.reason || "Failed to update item. Please try again.");
    }
  };

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

  const data = {
    Users: users,
    Roles: roles,
    Specialists: specialists,
    "Participant Groups": participantGroups,
    "Semesters": semesters,
    "Series": series,
    "Topics": topics,
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1 p-6">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#721D35]">{activeSection}</h1>
            <button
              className="bg-[#0EA6B2] text-white py-2 px-4 rounded hover:bg-[#0c8f9a] transition duration-200"
              onClick={() => setIsPopupOpen(true)}
            >
              + Add New
            </button>
          </header>

          <AdminTable
            data={data[activeSection]}
            sectionTitle={activeSection}
            fields={getFieldsForSection()}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <PopupForm
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            collection={getCollectionName()}
            fields={activeSection === 'Users' ? getUserFormFields() : getFieldsForSection()}
            title={`Add New ${activeSection.slice(0, -1)}`}
            onSuccess={() => {
              setIsPopupOpen(false);
              toast.success("Item added successfully!");
            }}
          />
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Admin;
