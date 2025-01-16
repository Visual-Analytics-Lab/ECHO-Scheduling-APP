import React, { useState } from "react";
import Navbar from "../navbar/Navbar";
import CalendarSidebar from "./CalendarSidebar"; // Create a new Sidebar for Calendar
import FullCalendar from "@fullcalendar/react"; // Import FullCalendar
import dayGridPlugin from "@fullcalendar/daygrid"; // Import plugins
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const Calendar = () => {
  const [activeOption, setActiveOption] = useState("Print Option 1");

  const handleSidebarClick = (option) => {
    setActiveOption(option);
    console.log(`Selected: ${option}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-1">
        <CalendarSidebar 
          activeOption={activeOption} 
          onOptionSelect={handleSidebarClick}
          options={[
            "Schedules by Week",
            "Schedules by Participant Groups",
            "Participant Groups by Semester",
            "Specialists by Semester",
            "Topics by Semester",
            "Semesters by Agency",
            "Topics by Participant Groups",
          ]}
        />
        <main className="flex-1 p-2">
            <header className="bg-white text-grey text-center py-2 rounded-t-lg border border-gray-300 shadow-lg">
                <h1 className="text-3xl">Sessions Calendar</h1>
            </header>
            <div className="bg-white shadow-lg rounded border border-gray-300 p-2 h-[calc(100vh-145px)]">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    height="100%"
                    editable={true}
                    selectable={true}
                    events={[
                        {
                            title: "Event 1",
                            start: "2025-01-20",
                            end: "2025-01-22",
                        },
                        {
                            title: "Event 2",
                            start: "2025-01-25",
                        },
                    ]}
                />
            </div>
        </main>
      </div>
    </div>
  );
};

export default Calendar;
