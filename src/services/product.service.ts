import { type FilterQuery, type QueryOptions, type ProjectionType } from 'mongoose'
import Product, { type ProductInput, type ProductDocument } from '../models/product.model'

export const create = async (productData: ProductInput): Promise<ProductDocument> => {
	const product = new Product(productData)
	await product.save()
	return product
}

export const find = async (query: FilterQuery<ProductDocument>, projection: ProjectionType<ProductDocument>, options: QueryOptions = { lean: true }): Promise<ProductDocument[]> => {
	const products = await Product.find(query, projection, options)
	return products
}
