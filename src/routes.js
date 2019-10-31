import { Router } from 'express';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import StudentController from './app/controllers/StudentController';
import PlansController from './app/controllers/PlansController';

import authMiddleware from './app/middleware/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

routes.use(authMiddleware);

routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);

// Plan Management
// routes.index('/planmanagement', PlanManagementController.index);
routes.post('/plans', PlansController.store);
// routes.put('/planmanagement/:id', PlanManagementController.update);
// routes.delete('/planmanagement/:id', PlanManagementController.delete);

export default routes;
