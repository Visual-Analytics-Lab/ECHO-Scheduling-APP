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
    participantGroup,
    topic,
  } = event.extendedProps;

  // Helper to get name + color wrapped in a styled span
  const getStyledSpecialist = (id) => {
    const name = getSpecialistName(id);
    const color = getSpecialistColor(id);
    return name ? `<div style="color: ${color || 'black'};">${name}</div>` : "";
  };

  const specialistsHTML = [
    getStyledSpecialist(presentingSpecialist),
    getStyledSpecialist(supportingSpecialist1),
    getStyledSpecialist(supportingSpecialist2),
  ]
    .filter(Boolean)
    .join("") || "<div>TBD</div>";

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
