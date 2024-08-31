import { type FilterQuery, type QueryOptions, type ProjectionType, type UpdateQuery, type UpdateWriteOpResult } from 'mongoose'
import Batch, { type BatchInput, type BatchDocument } from '../models/batch.model'

export const create = async (batchData: BatchInput): Promise<BatchDocument> => {
	const batch = new Batch(batchData)
	await batch.save()
	return batch
}

export const findByIdAndUpdate = async (id: string, update: UpdateQuery<BatchDocument>, options: QueryOptions = { new: true }): Promise<BatchDocument | null> => {
	const batch = await Batch.findByIdAndUpdate(id, update, options)
	return batch
}

export const findById = async (id: string, projection: ProjectionType<BatchDocument>, options: QueryOptions = { lean: true }): Promise<BatchDocument | null> => {
	const batch = await Batch.findById(id, projection, options)
	return batch
}

