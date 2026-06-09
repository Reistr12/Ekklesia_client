import { env } from '../../env/config'

import * as mock from './mock'
import * as service from './service'

const selectedModule = env.useMock === true ? mock : service

export const getRecordedServicesData = selectedModule.getRecordedServicesData
export const createRecordedService = selectedModule.createRecordedService
export const updateRecordedService = selectedModule.updateRecordedService
export const deleteRecordedService = selectedModule.deleteRecordedService
