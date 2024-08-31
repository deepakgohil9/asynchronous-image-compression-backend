import mongoose, { Types } from 'mongoose'

export interface ProductInput {
	batch_id: Types.ObjectId,
	serial_no: number,
	product_name: string,
	input_image_urls: string[]
	output_image_urls: string[]
}

export interface ProductDocument extends ProductInput, mongoose.Document {
	createdAt: Date
	updatedAt: Date
}

const productSchema = new mongoose.Schema<ProductDocument>({
	batch_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Batch',
		required: true
	},
	serial_no: {
		type: Number,
		required: true
	},
	product_name: {
		type: String,
		required: true
	},
	input_image_urls: {
		type: [String],
		required: true
	},
	output_image_urls: {
		type: [String],
		required: true
	}
}, { timestamps: true })

const Product = mongoose.model<ProductDocument>('Product', productSchema)

export default Product
