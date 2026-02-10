// tooltipHelpers.js

import { 
  getSpecialistName, 
  getSpecialistColor,
  getParticipantGroupName, 
  getParticipantGroupColor,
  getTopicName,
} from './collectionHelpers';


export const buildSessionTooltip = ({ event }) => {
  const startStr = event.start?.toLocaleString();

  // pull your extendedProps
  const {
    color,
    presentingSpecialist,
    supportingSpecialist1,
    supportingSpecialist2,
    supportingSpecialist3,
    supportingSpecialist4,
    participantGroup,
    topic,
  } = event.extendedProps;

  // Helper to get name + color wrapped in a styled span
  const getStyledSpecialist = (id, role = "") => {
    if (!id) return null; // Don't show anything if no ID
    const name = getSpecialistName(id);
    const color = getSpecialistColor(id);
    
    // If name is still showing as an ID or "No specialist", don't display it
    if (!name || name.includes("Specialist ID:") || name === "No specialist") {
      return null;
    }
    
    const roleLabel = role ? ` (${role})` : "";
    return `<div style="color: ${color || 'black'};">${name}${roleLabel}</div>`;
  };

  const specialists = [
    getStyledSpecialist(presentingSpecialist, "Presenting"),
    getStyledSpecialist(supportingSpecialist1, "Support 1"),
    getStyledSpecialist(supportingSpecialist2, "Support 2"),
    getStyledSpecialist(supportingSpecialist3, "Support 3"),
    getStyledSpecialist(supportingSpecialist4, "Support 4"),
  ].filter(Boolean);

  const specialistsHTML = specialists.length > 0 
    ? specialists.join("") 
    : "<div>No specialist assigned</div>";

  const groupName = getParticipantGroupName(participantGroup);
  const groupColor = getParticipantGroupColor(participantGroup);
  const styledGroup = `<div style="color: ${groupColor};">${groupName}</div>`;

  const topicName = getTopicName(topic);

  return `
    <div style="max-width:220px; line-height:1.3;">
      <div style="background-color:rgb(225, 227, 230); padding:6px 10px; margin: 3px 0px -5px 0px; font-weight:bold; border-radius: 5px; color: ${color}">
        ${event.title}
      </div>
      <div style="padding:0.5em;">
        <small>${startStr}</small><br/><br/>

        <strong>Specialists:</strong><br/>
        ${specialistsHTML}<br/>

        <strong>Participant Group:</strong><br/>
        ${styledGroup}<br/>
        <strong>Topic:</strong> ${topicName || "TBD"}
        
      </div>
    </div>
  `;
};