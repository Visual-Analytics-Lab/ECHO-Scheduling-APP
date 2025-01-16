import React from "react";

const CalendarSidebar = ({ activeOption, onOptionSelect, options }) => {
  return (
    <aside className="w-64 bg-gray-100 text-black m-4 border border-[#721D35] rounded-lg shadow-xl">
      <div className="py-3 px-4 bg-[#721D35] rounded-t-lg">
        <h2 className="text-lg text-white">🖶 Print</h2>
      </div>
      <nav className="space-y-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onOptionSelect(option)}
            className={`block w-full text-left px-6 py-2 text-sm hover:bg-gray-300 ${
              activeOption === option ? "" : ""
            }`}
          >
            {option}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default CalendarSidebar;
