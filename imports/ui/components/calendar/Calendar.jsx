import React, { useState } from "react";
import { useTracker } from 'meteor/react-meteor-data';
import CreateSessionModal from "./CreateSessionModal";
import Navbar from "../navbar/Navbar";
import CalendarSidebar from "./CalendarSidebar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { SessionsCollection } from "../../../api/collections";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import { Meteor } from "meteor/meteor";

const Calendar = () => {
  const [activeOption, setActiveOption] = useState("Print Option 1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const sessions = useTracker(() => {
    Meteor.subscribe('sessions');
    return SessionsCollection.find().fetch()
  });

  const handleSidebarClick = (option) => {
    setActiveOption(option);
  };

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setIsModalOpen(true);
  };

  const handleCreateSession = (formData) => {
    Meteor.call(`sessions.insert`, formData, (error, result) => {
      if (error) {
        console.log(error);
        toast.error(error.reason || 'An error occurred');
      } else {
        toast.success("Successfully added new session")
      }
    });
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
                    select={handleDateClick}
                    events={sessions?.map(session => ({
                      title: session.sessionTitle,
                      start: new Date(session.dateTime).toISOString(),
                      end: session.presentationsDue ? new Date(session.presentationsDue).toISOString() : null,
                    }))}
                />
              <CreateSessionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateSession}
                selectedDate={selectedDate}
              />
            </div>
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Calendar;
