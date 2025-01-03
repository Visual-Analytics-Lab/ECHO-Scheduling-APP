import React, { useState } from "react";
import Navbar from '../navbar/Navbar';
import AdminSidebar from "./AdminSidebar";
import AdminTable from "./AdminTable";

const Admin = () => {
  const [activeSection, setActiveSection] = useState("Users");

  const data = {
    Users: [
      { id: 1, username: "bob.smith", email: "bob.smith@email.com" },
      { id: 2, username: "john.doe", email: "john.doe@email.com" },
      { id: 3, username: "emma.roberts", email: "e.roberts@email.com" },
    ],
    Specialists: [
      { id: 1, name: "Cheryl H. Santana", specialty: "Sp1", email: "chery@teleworm.us", phone: "216-446-9148", institute: "MSU" },
      { id: 2, name: "Susan S. Beasley", specialty: "Sp2", email: "susan@mail.com", phone: "625-978-7189", institute: "LSU" },
      { id: 3, name: "Barbara L. Hunt", specialty: "Sp1", email: "bar@hotmail.com", phone: "855-856-6854", institute: "BSU" },
      { id: 4, name: "Margaret R. Wetzel", specialty: "Sp4", email: "mr@byu.edu", phone: "564-884-8915", institute: "BYU" },
      { id: 5, name: "Mario C. Freeman", specialty: "Sp3", email: "mfc@edu", phone: "858-846-9428", institute: "MIT" },
    ],
    "Participant Groups": [
      { id: 1, name: "Participant Group 1", agency: "Ag1", email: "p.g1@teleworm.us", phone: "216-446-9148", families: "F1" },
      { id: 2, name: "Participant Group 2", agency: "Ag2", email: "p.g2@teleworm.us", phone: "625-978-7189", families: "F1" },
      { id: 3, name: "Participant Group 3", agency: "Ag3", email: "p.g3@teleworm.us", phone: "855-856-6854", families: "F1" },
      { id: 4, name: "Participant Group 4", agency: "Ag1", email: "p.g4@teleworm.us", phone: "564-884-8915", families: "F1" },
    ],
    "Cohort Groups": [
      { id: 1, name: "Cohort 1", date: "Winter 2024", description: "description 1" },
      { id: 2, name: "Cohort 2", date: "Spring 2025", description: "description 2" },
      { id: 3, name: "Cohort 3", date: "Summer 2025", description: "description 3" },
    ],
    Topics: [
      { id: 1, name: "Topic 1", date: "Winter 2024", description: "description 1" },
      { id: 2, name: "Topic 2", date: "Spring 2025", description: "description 2" },
      { id: 3, name: "Topic 3", date: "Summer 2025", description: "description 3" },    
    ],
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

        {/* Main Section */}
        <main className="flex-1 p-6">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#721D35]">{activeSection}</h1>
            <button className="bg-[#0EA6B2] text-white py-2 px-4 rounded hover:bg-[#0c8f9a]">
              + Add New
            </button>
          </header>
          <AdminTable data={data[activeSection]} sectionTitle={activeSection} />
        </main>
      </div>
    </div>
  );
};

export default Admin;
