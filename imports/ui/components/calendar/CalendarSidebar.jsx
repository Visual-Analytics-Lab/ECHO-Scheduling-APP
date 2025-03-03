import React from "react";
import { MdLocalPrintshop } from "react-icons/md";

const CalendarSidebar = ({ activeOption, onOptionSelect, options }) => {
  return (
    <aside className="w-64 bg-gray-100 text-black m-4 border border-gray-300 rounded-lg shadow-full-border">
      <div className="py-3 px-4 bg-echo-maroon rounded-t-lg -m-[1px]">
        <h2 className="flex text-xl text-white items-center"><MdLocalPrintshop className="mr-2" size={28}/> Print</h2>
      </div>
      <nav className="flex flex-col justify-between items-center space-y-3">
        <div></div>
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onOptionSelect(option)}
            className={`rounded-lg w-5/6 text-left text-base px-4 py-3 text-sm bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400`}
          >
            {option}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default CalendarSidebar;
