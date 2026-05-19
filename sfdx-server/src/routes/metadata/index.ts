import { Router } from 'express';
// import objectsRouter from './objects.js';
// import fieldsRouter from './fields.js';

import objectsRouter from './objects'
import fieldsRouter from "./fields"

const router = Router();

router.use('/objects', objectsRouter);
router.use('/fields', fieldsRouter);

export default router;