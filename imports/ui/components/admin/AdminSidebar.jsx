import React from "react";

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  const sections = [
    { label: "Users", value: "Users" },
    { label: "Roles", value: "Roles" },
    { label: "Specialists", value: "Specialists" },
    { label: "Participant Groups", value: "Participant Groups" },
    { label: "Semesters", value: "Semesters" },
    { label: "Series", value: "Series" },
    { label: "Presentation Titles", value: "Topics" }, 
    { label: "Categories", value: "Categories" },
  ];

  return (
    <aside className="w-64 bg-white text-black m-4 border border-gray-300 rounded-lg shadow-full-border">
      <div className="py-3 px-4 bg-echo-maroon rounded-t-lg -m-[1px]">
        <h2 className="text-xl text-white">Setup</h2>
      </div>
      <nav className="flex flex-col justify-between items-center space-y-3">
        <div></div>
        {sections.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setActiveSection(value)}
            className={`rounded-lg w-[90%] text-left text-base px-4 py-3 text-md hover:bg-neutral-300 active:bg-neutral-400 ${
              activeSection === value ? "bg-neutral-300" : "bg-neutral-200"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
