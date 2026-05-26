import { Router } from 'express';
import objectsRouter from './objects';
import fieldsRouter from './fields';
import projectRouter from './project'; // ← ADD THIS

const router = Router();

router.use('/', projectRouter);          // ← ADD THIS (mounts /project-setup and /fetch-latest)
router.use('/objects', objectsRouter);
router.use('/fields', fieldsRouter);

export default router;