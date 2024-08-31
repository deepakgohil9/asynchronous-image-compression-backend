import mongoose from 'mongoose'

export interface BatchInput {
	status?: 'completed' | 'in progress' | 'in queue' | 'failed',
	s3Key: string,
	message?: string
}

export interface BatchDocument extends BatchInput, mongoose.Document {
	createdAt: Date
	updatedAt: Date
}

const batchSchema = new mongoose.Schema<BatchDocument>({
	status: {
		type: String,
		required: true,
		enum: ['completed', 'in progress', 'in queue', 'failed'],
		default: 'in queue'
	},
	s3Key: {
		type: String,
		required: true,
	},
	message: {
		type: String,
		required: true,
		default: 'Processing request is in the queue'
	}
}, { timestamps: true })

const Batch = mongoose.model<BatchDocument>('Batch', batchSchema)

export default Batch
