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
import { printExcel } from "./Printing";

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
 
  // When clicking to create new event, populate date field with selected
  const handleDateClick = (info) => {
    setSelectedDate(info.start);
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
    printExcel(option);
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
        <main className="flex-1 p-4">
          <div className="w-[55vw] rounded-lg shadow-full-border">
            <header className="bg-white text-grey text-center py-3 rounded-t-lg border border-b-0 border-gray-300">
                <h1 className="text-3xl">Sessions Calendar</h1>
            </header>
            <div className="bg-white rounded-b-lg border border-gray-300 p-2 h-[calc(100vh-145px)]">
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
                events={sessions?.map(session => {
                  const start = new Date(session.dateTime);
                  const end = new Date(start);
                  end.setHours(end.getHours() + 1); // Add 1 hour
                
                  return {
                    title: session.sessionTitle,
                    start: start.toISOString(),
                    end: end.toISOString(),
                    backgroundColor: session.color,
                    borderColor: session.color,
                    extendedProps: {
                      sessionId: session._id
                    }
                  };
                })}
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
          </div>
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Calendar;