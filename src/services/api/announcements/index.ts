import { env } from '../../env/config'

import * as mock from './mock'
import * as service from './service'

const selectedModule = env.useMock === true ? mock : service

export const getAnnouncementsData = selectedModule.getAnnouncementsData
export const createAnnouncement = selectedModule.createAnnouncement
export const updateAnnouncement = selectedModule.updateAnnouncement
export const deleteAnnouncement = selectedModule.deleteAnnouncement
