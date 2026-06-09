import { env } from '../../env/config'

import * as mock from './mock'
import * as service from './service'

const selectedModule = env.useMock === true ? mock : service

export const getPrayerData = selectedModule.getPrayerData
export const createPrayer = selectedModule.createPrayer
export const updatePrayer = selectedModule.updatePrayer
export const deletePrayer = selectedModule.deletePrayer
