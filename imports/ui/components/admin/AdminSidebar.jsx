import React from "react";

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  const sections = [
    "Users",
    "Specialists",
    "Participant Groups",
    "Semesters",
    "Series",
    "Topics",
  ];

  return (
    <aside className="w-64 bg-gray-100 text-black m-4 border border-[#721D35] rounded-lg shadow-xl">
      <div className="py-3 px-4 bg-[#721D35] rounded-t-lg">
        <h2 className="text-lg text-white">Setup</h2>
      </div>
      <nav className="space-y-2">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`block w-full text-left px-6 py-2 text-sm hover:bg-gray-300 ${
              activeSection === section ? "bg-gray-300" : ""
            }`}
          >
            {section}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
