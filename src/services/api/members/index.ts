import { env } from '../../env/config'

import * as mock from './mock'
import * as service from './service'

const selectedModule = env.useMock === true ? mock : service

export const getMembersData = selectedModule.getMembersData
export const createMember = selectedModule.createMember
export const updateMember = selectedModule.updateMember
export const deleteMember = selectedModule.deleteMember
