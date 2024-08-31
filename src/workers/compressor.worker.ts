import connect from '../databases/mongo.database'

import path from 'path'
import { SandboxedJob, type Job } from 'bullmq'
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { Upload } from '@aws-sdk/lib-storage';
import { parseStream } from '@fast-csv/parse'
import Trasformer from '../utils/compress'

import config from '../config'

connect()
	.then(() => {
		console.log('⚙️ Worker started !')
	}).catch((error) => {
		throw new Error(`❗Error connecting to the database: ${(error as Error).message}`)
	})

import * as batchService from '../services/batch.service'
import * as productService from '../services/product.service'
import { inputCsvSchema, type InputCsvSchemaType, } from '../schemas/csv.schema';

type CsvRow = {
	'S. No.': string;
	'Product Name': string;
	'Input Image Urls': string;
}

const bucket = process.env.BUCKET_NAME as string
const s3 = new S3Client({
	region: process.env.AWS_REGION as string,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
	},
});

const getObjectStream = async (bucket: string, key: string) => {
	const command = new GetObjectCommand({
		Bucket: bucket,
		Key: key,
	});
	const response = await s3.send(command);
	return response.Body;
}

const parseNCompress = async (bucket: string, data: Record<any, any>): Promise<void> => {
	const csvStream = await getObjectStream(bucket, data.s3Key);
	if (!csvStream) {
		throw new Error('File not found');
	}

	return new Promise((resolve, reject) => {
		parseStream<CsvRow, InputCsvSchemaType>(csvStream as NodeJS.ReadableStream, { headers: true })
			.transform((row: CsvRow): InputCsvSchemaType => {
				return {
					'S. No.': parseInt(row['S. No.']),
					'Product Name': row['Product Name'],
					'Input Image Urls': row['Input Image Urls'].replace(/, /g, ',').split(',')
				}
			})
			.validate((row: InputCsvSchemaType): boolean => {
				const result = inputCsvSchema.safeParse(row)
				return result.success
			})
			.on('data-invalid', (row: CsvRow, rowNumber: number) => {
				throw new Error(`Invalid row at line ${rowNumber}`)
			})
			.on('data', async (row: InputCsvSchemaType) => {
				const outputUrls = await Promise.all(row['Input Image Urls'].map(async (url, idx): Promise<string> => {
					const compressedBuffer = await Trasformer(url)
					const s3upload = new Upload({
						client: s3,
						params: {
							Bucket: bucket,
							Key: `output/${path.basename(data.s3Key, path.extname(data.s3Key))}/${row['S. No.']}-${idx}.jpg`,
							Body: compressedBuffer,
							ACL: 'public-read',
							ContentType: 'image/jpeg'
						}
					})
					const output = await s3upload.done()
					return output.Location as string
				}))

				const product = await productService.create({
					batch_id: data._id,
					serial_no: row['S. No.'],
					product_name: row['Product Name'],
					input_image_urls: row['Input Image Urls'],
					output_image_urls: outputUrls
				})
			})
			.on('error', (error) => {
				reject(error)
			})
			.on('end', () => resolve());
	});
}

export const failedEventHandler = async (job: Job<any, any, string> | undefined, error: Error) => {
	batchService.findByIdAndUpdate(job?.data._id, { status: 'failed', message: error.message })
		.catch((error) => {
			throw new Error(`❗Error updating batch status: ${(error as Error).message}`)
		})
}

export default async function compressorJob(job: SandboxedJob) {
	const { data } = job
	await batchService.findByIdAndUpdate(data._id, { status: 'in progress' })
	await parseNCompress(bucket, data)
	await batchService.findByIdAndUpdate(data._id, { status: 'completed', message: 'Batch processed successfully' })
	const response = await fetch(config.webhookUrl, {
		method: 'POST',
		body: `Batch ${data._id} processed successfully`
	})
}


