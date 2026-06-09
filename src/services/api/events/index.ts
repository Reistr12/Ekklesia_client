import { env } from '../../env/config';

import * as mock from './mock';
import * as service from './service';

const selectedModule = env.useMock === true ? mock : service;

export const getEventsData = selectedModule.getEventsData;
export const createEvent = selectedModule.createEvent;
export const updateEvent = selectedModule.updateEvent;
export const deleteEvent = selectedModule.deleteEvent;