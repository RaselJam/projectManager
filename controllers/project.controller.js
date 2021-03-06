import projectModel from '../models/Project.model.js';
import { removeThisProjectTickets } from './ticket.controller.js';
//FIXME Clean duplicated and Refactor all, some Function were never used,track and clean them
//Basic Crud :
export const createProject = (project) => {
  return projectModel.create(project);
}

export const getProjectById = (id) => {
  return projectModel.findOne({ _id: id }).populate('developers').populate('managers');
}
export const getRelatedProjects = (userId) => {
  return Promise.all([getCreatorProjects(userId), getManagerProjects(userId), getDeveloperProjects(userId)])
}
export const getProjectByFilter = (filter) => {
  return projectModel.find(filter);
}

export const getAllProject = () => {
  return projectModel.find().populate('developers').populate('managers')
}

export const getCreatorProjects = (userId) => {
  return projectModel.find({ creator: userId }).populate('developers').populate('managers')
}

export const getDeveloperProjects = (developerId) => {
  return projectModel.find({ developers: developerId }).populate('developers').populate('managers')
}

export const getManagerProjects = (managerId) => {
  return projectModel.find({ managers: managerId }).populate('developers').populate('managers')
}
export const updateProject = async (creatorId, project) => {
  console.log("got in update project control creatorId:", creatorId)
  const id = project._id;
  delete project._id;
  console.log("projectID: ", id)
  const projectTarget = await projectModel.findOne({ _id: id, creator: creatorId }).populate('developers').populate('managers')
  console.log("project : ", projectTarget)
  if (projectTarget) {
    return projectModel.findByIdAndUpdate(id, project, { new: true })
  }
  else throw new Error("un authorized attempt, user tried to update a  project not beeing the creator")
}
//Deleting :
export const removeProject = async (creatorId, id) => {
  console.log("got in remove proj control")
  const project = await projectModel.findOne({ _id: id, creator: creatorId }).populate('managers').populate('developers')
  console.log("project : ", project)
  if (project) {
    return Promise.all([
      projectModel.findByIdAndDelete(id),
      removeThisProjectTickets(id)
    ])
  }
  else throw new Error("un authorized attempt, user tried to remove a  project not beeing the creator")

}
//more specific commands :
export const addDevToProject = (managerId, projectId, developerId) => {
  return projectModel.findOneAndUpdate(
    { _id: projectId, managers: managerId },
    { $push: { "developers": developerId } }, { new: true }).populate('developers').populate('managers')
}
export const addManagerToProject = (creatorId, projectId, managerId) => {
  return projectModel.findOneAndUpdate(
    { _id: projectId, creator: creatorId },
    { $push: { "managers": managerId } }, { new: true }).populate('developers').populate('managers')
}

