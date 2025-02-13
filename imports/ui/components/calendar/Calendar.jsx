import React, { useState } from "react";
import { useTracker } from 'meteor/react-meteor-data';
import SessionModal from "./SessionModal";
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
  const [selectedSession, setSelectedSession] = useState(null);

  const sessions = useTracker(() => {
    Meteor.subscribe('sessions');
    return SessionsCollection.find().fetch()
  });

  const handleSidebarClick = (option) => {
    setActiveOption(option);
    handlePrint(option);
  };
 
  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setIsModalOpen(true);
  };

  const handleEventClick = (info) => {
    const sessionId = info.event.extendedProps.sessionId;
    const session = sessions.find(s => s._id === sessionId);
    if (session) {
      setSelectedSession(session);
      setIsModalOpen(true);
    }
  };
  const handlePrint = (option) => {
    if (option === "Schedules by Week") {
      // Get the current date
      const today = new Date();
  
      // Calculate the first day (Sunday) of this week
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay());
      firstDayOfWeek.setHours(0, 0, 0, 0);
  
      // Calculate the last day (Saturday) of this week
      const lastDayOfWeek = new Date(today);
      lastDayOfWeek.setDate(today.getDate() - today.getDay() + 6);
      lastDayOfWeek.setHours(23, 59, 59, 999);
  
      // Call the exportCSV method passing the boundaries of the week
      Meteor.call('exportCSV', firstDayOfWeek, lastDayOfWeek, (error, csv) => {
        if (error) {
          console.error("Error exporting CSV:", error);
          // Optionally, you can use your toast notification here as well.
        } else {
          // Optionally trigger a download for the CSV file.
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "schedules_by_week.csv";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
    } else {
      console.log("Other print options not implemented yet.");
    }
  };
  
  
  const handleSubmit = (formData, sessionId) => {
    if (sessionId) {
      // Update existing session
      Meteor.call('sessions.update', sessionId, formData, (error) => {
        if (error) {
          toast.error(error.reason || 'An error occurred');
        } else {
          toast.success('Session updated successfully');
        }
      });
    } else {
      // Create new session
      Meteor.call('sessions.insert', formData, (error) => {
        if (error) {
          toast.error(error.reason || 'An error occurred');
        } else {
          toast.success('Session created successfully');
        }
      });
    }
  };
  const handleDelete = (sessionId) => {
    Meteor.call('sessions.remove', sessionId, (error) => {
      if (error) {
        toast.error(error.reason || 'An error occurred');
      } else {
        toast.success('Session deleted successfully');
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
                eventClick={handleEventClick} 
                events={sessions?.map(session => ({
                  title: session.sessionTitle,
                  start: new Date(session.dateTime).toISOString(),
                  end: session.presentationsDue ? new Date(session.presentationsDue).toISOString() : null,
                  backgroundColor: session.color,
                  borderColor: session.color,
                  extendedProps: {
                    sessionId: session._id  // Make sure to include this!
                  }
                }))}
            />
              <SessionModal
                isOpen={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  setSelectedSession(null);
                }}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
                selectedDate={selectedDate}
                existingSession={selectedSession}
              />
            </div>
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Calendar;