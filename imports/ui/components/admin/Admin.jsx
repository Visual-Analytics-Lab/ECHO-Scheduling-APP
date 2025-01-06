import React, { useState, useEffect } from "react";
import { useTracker } from 'meteor/react-meteor-data'
import Navbar from '../navbar/Navbar';
import AdminSidebar from "./AdminSidebar";
import AdminTable from "./AdminTable";
import {
  SpecialistsCollection,
  ParticipantGroupsCollection,
  CohortGroupsCollection,
  TopicsCollection,
} from '../../../api/collections';
import PopupForm from '../popup_form/PopupForm'

const Admin = () => {
  const [activeSection, setActiveSection] = useState("Users");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const sub0 = Meteor.subscribe('users');
    const sub1 = Meteor.subscribe('specialists');
    const sub2 = Meteor.subscribe('participantGroups');
    const sub3 = Meteor.subscribe('cohortGroups');
    const sub4 = Meteor.subscribe('topics');
    return () => {
      sub0.stop();
      sub1.stop();
      sub2.stop();
      sub3.stop();
      sub4.stop();
    };
  }, []);
  const users = useTracker(()=> Meteor.users.find().fetch());
  const specialists = useTracker(()=>SpecialistsCollection.find().fetch());
  const participantGroups = useTracker(() => ParticipantGroupsCollection.find().fetch());
  const cohortGroups = useTracker(() => CohortGroupsCollection.find().fetch());
  const topics = useTracker(() => TopicsCollection.find().fetch());
  const getFieldsForSection = () => {
    switch (activeSection) {
      case 'Users':
        return [
          {email: 'email', label:'Email'}
        ];
      case 'Specialists':
        return [
          {name: 'name', label: 'Name'},
          { name: 'speciality', label: 'Specialty' },
          { name: 'email', label: 'Email' },
          { name: 'phone', label: 'Phone' },
          { name: 'institute', label: 'Institute' }
        ];
      case 'Participant Groups':
        return [
          {name: 'name', label: 'Name'},
          { name: 'agency', label: 'Agency' },
          { name: 'email', label: 'Email' },
          { name: 'phone', label: 'Phone' },
          { name: 'families', label: 'Families' }
        ];
      case 'Cohort Groups':
        return [
          {name: 'title', label: 'Title'},
          { name: 'description', label: 'Description' },
        ];
      case 'Topics':
        return [
          {name: 'title', label: 'Title'},
          { name: 'description', label: 'Description' },
        ];
      default:
        return [];
    }
  };
  const getCollectionName = () => {
    switch(activeSection) {
      case 'Users': return 'users';
      case 'Specialists': return 'specialists';
      case 'Participant Groups': return 'participantGroups';
      case 'Cohort Groups': return 'cohortGroups';
      case 'Topics': return 'topics';
      default: return '';
    }
  };

  const data = {
    Users: users,
    Specialists: specialists,
    "Participant Groups": participantGroups,
    "Cohort Groups": cohortGroups,
    Topics: topics,
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
              className="bg-[#0EA6B2] text-white py-2 px-4 rounded hover:bg-[#0c8f9a]"
              onClick={() => setIsPopupOpen(true)}
            >
              + Add New
            </button>
          </header>
          <AdminTable 
            data={data[activeSection]} 
            sectionTitle={activeSection} 
          />
          
          <PopupForm
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            collection={getCollectionName()}
            fields={getFieldsForSection()}
            title={`Add New ${activeSection.slice(0, -1)}`} 
            onSuccess={() => {
              setIsPopupOpen(false);
              //ADD Success Message here, maybe
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default Admin;