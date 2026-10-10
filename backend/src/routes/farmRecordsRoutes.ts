import { Router } from 'express';
import { FarmRecordsController } from '../controllers/farmRecordsController';

export const farmRecordsRouter = Router();

farmRecordsRouter.get('/', FarmRecordsController.getRecords);
farmRecordsRouter.post('/', FarmRecordsController.createRecord);
farmRecordsRouter.delete('/:id', FarmRecordsController.deleteRecord);
farmRecordsRouter.post('/bulk', FarmRecordsController.syncBulkRecords);
