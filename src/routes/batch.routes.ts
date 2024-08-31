import express from 'express'
import validate from '../middlewares/validate.middleware'
import upload from '../middlewares/upload.middleware'
import * as controller from '../controllers/batch.controller'
import * as schema from '../schemas/batch.schema'

const router = express.Router()

router.post('/', upload.single('batch_data'), controller.createBatchRequest)
router.get('/:id', validate(schema.getBatchSchema), controller.getBatch)

export default router
