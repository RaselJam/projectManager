import * as projectLogic from '../../controllers/project.controller.js'
/**
 *each item key is a String, beside the 'related' key wich is an array of all roles.
 */
export const ROLES = {
  creator: 'creator',
  managers: 'managers',
  developers: 'developers',
  /**return an array ['developers','managers','creator'] */
  related: ['developers', 'managers', 'creator']
}
Object.freeze(ROLES)
//

export async function onlyThease(acceptedRoles) {
  return async function (req, res, next) {

    try {
      const userId = req.session.currentUser._id
      //Axios  on including body to GET Requestfallback to params if its not present
      let { projectId } = req.body
      console.log("projectID: ", projectId)
      if (!projectId && req.params.id) {
        projectId = req.params.id
      }
      else if(!projectId) {
        //Last resort get theprojectID from URL :
        //there must be better way for all this butno time for now
        //TODO Refactor the whole idea of getting projectId from cliente and validatation
        let destruct = req.originalUrl.split('/')
        projectId = destruct[destruct.length - 1];

      }
      //
      console.log("params: ", req.params)

      let amIIn = await isAuthorized({ userId, projectId, acceptedRoles })
      console.log("Authorized? : ", amIIn)
      const [, ...superiors] = acceptedRoles;
      if (amIIn) next();//All good continue
      else throw new Error(`Un Authorized attempt, user must be one of these roles : ${acceptedRoles.join(' / ')} to have access, Contact project ${superiors.join(' OR ')} of this project`)
    } catch (error) {
      next(error)
    }
  }
}

//helpers :

async function isAuthorized({ userId, projectId, acceptedRoles }) {
  if (!projectId) throw new Error("Add projectId in your Request body")
  const project = await projectLogic.getProjectById(projectId)
  let result = false;
  for (let i = 0; i < acceptedRoles.length; i++) {
    if (acceptedRoles[i] === ROLES.creator) {
      result = project.creator.equals(userId);

    } else {
      result = project[acceptedRoles[i]]?.some(elm => elm.equals(userId))
    }
    if (result) break;
  }
  return result;
}
