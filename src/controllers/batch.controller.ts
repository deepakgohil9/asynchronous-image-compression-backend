import { type Request, type Response, type NextFunction } from 'express'
import { HttpException, httpErrors } from '../utils/HttpException'
import ApiResponse from '../utils/ApiResponse'
import asyncHandler, { type Req } from '../utils/asyncHandler'
import queue from '../utils/queue'

import { type BatchDocument } from '../models/batch.model'
import { type ProductDocument } from '../models/product.model'
import { type GetBatchSchemaType } from '../schemas/batch.schema'
import * as batchService from '../services/batch.service'
import * as productService from '../services/product.service'

export const createBatchRequest = asyncHandler(async (
	req: Request,
	res: Response,
	next: NextFunction): Promise<void> => {

	if (!req.file) {
		return next(new HttpException(httpErrors.BAD_REQUEST, 'File not found'))
	}

	const { key } = req.file as Express.MulterS3.File
	const batch = await batchService.create({ s3Key: key })
	const { s3Key, ...data } = batch.toObject<BatchDocument>()

	await queue.add('compress', { _id: data._id, s3Key })
	res.status(201).send(new ApiResponse<BatchDocument>('Batch created successfully', data))
})

export const getBatch = asyncHandler(async (
	req: Req<GetBatchSchemaType>,
	res: Response,
	next: NextFunction): Promise<void> => {

	const batch = await batchService.findById(req.params.id, { s3Key: 0 })
	if (!batch) {
		return next(new HttpException(httpErrors.NOT_FOUND, 'Batch not found'))
	}

	const products = await productService.find({ batch_id: batch._id }, { batch_id: 0 })
	res.status(200).send(new ApiResponse<BatchDocument & { products: ProductDocument[] }>('Batches fetched successfully', { ...batch, products }))
})
