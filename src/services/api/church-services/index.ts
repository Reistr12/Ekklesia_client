import { env } from '../../env/config'

import * as mock from './mock'
import * as service from './service'

const selectedModule = env.useMock === true ? mock : service

export const getChurchServicesData = selectedModule.getChurchServicesData
export const createChurchService = selectedModule.createChurchService
export const updateChurchService = selectedModule.updateChurchService
export const deleteChurchService = selectedModule.deleteChurchService
