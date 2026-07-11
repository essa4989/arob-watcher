import { Router } from 'express';
import { authRouter } from './auth.routes';
import { logRouter } from './log.routes';
import { statusRouter } from './status.routes';
import { journeyRouter } from './journey.routes';
import { rewardsRouter } from './rewards.routes';
import { medScheduleRouter } from './medSchedule.routes';
import { reportsRouter } from './reports.routes';
import { settingsRouter } from './settings.routes';
import { pushRouter } from './push.routes';
import { attachSession } from '../middleware/auth';
import { attachChild } from '../middleware/child';

export const apiRouter = Router();

apiRouter.use(attachSession, attachChild);

apiRouter.use('/auth', authRouter);
apiRouter.use('/log', logRouter);
apiRouter.use('/status', statusRouter);
apiRouter.use('/journey', journeyRouter);
apiRouter.use('/rewards', rewardsRouter);
apiRouter.use('/med-schedule', medScheduleRouter);
apiRouter.use('/reports', reportsRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/push', pushRouter);
