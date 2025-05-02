import { SpecialistsCollection, ParticipantGroupsCollection, TopicsCollection } from "../../api/collections";


export const getSpecialistName = (id) => {
  if (!id) return "";
  const specialist = SpecialistsCollection.findOne(id);
  if (specialist) return specialist.firstName + " " + specialist.lastName
  return "Unknown Specialist";
};
export const getSpecialistColor = (id) => {
  if (!id) return "";
  const specialist = SpecialistsCollection.findOne(id);
   return specialist?.nameColor || "";
};

export const getParticipantGroupName = (id) => {
  if (!id) return "";
  const group = ParticipantGroupsCollection.findOne(id);
  return group?.name || "Unknown Group";
};
export const getParticipantGroupColor = (id) => {
  if (!id) return "";
  const group = ParticipantGroupsCollection.findOne(id);
  return group?.nameColor || "";
};

export const getTopicName = (id) => {
  if (!id) return "";
  const topic = TopicsCollection.findOne(id);
  return topic?.title || "Unknown Topic";
};