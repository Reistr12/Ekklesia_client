import { env } from '../../env/config'

import * as mock from './mock'
import * as service from './service'

const selectedModule = env.useMock === true ? mock : service

export const login = selectedModule.login
export const register = selectedModule.register
