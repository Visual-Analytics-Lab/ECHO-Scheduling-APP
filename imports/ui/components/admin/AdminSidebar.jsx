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
    <aside className="w-64 bg-white text-black m-4 border border-gray-300 rounded-lg shadow-full-border">
      <div className="py-3 px-4 bg-echo-maroon rounded-t-lg -m-[1px]">
        <h2 className="text-xl text-white">Setup</h2>
      </div>
      <nav className="flex flex-col justify-between items-center space-y-3">
        <div></div>
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`rounded-lg w-[90%] text-left text-base px-4 py-3 text-md hover:bg-neutral-300 active:bg-neutral-400 ${
              activeSection === section ? "bg-neutral-300" : "bg-neutral-200"
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
