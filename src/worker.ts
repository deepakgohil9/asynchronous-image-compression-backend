/* eslint-disable no-console */
import { Worker } from 'bullmq'
import path from 'path'
import { fileURLToPath } from 'url'
import { failedEventHandler } from './workers/compressor.worker'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const extension = path.extname(__filename)
const processFile = path.join(__dirname, 'workers/compressor.worker' + extension)

const worker = new Worker('compress', processFile, {
	connection: {
		host: process.env.REDIS_HOST,
		username: process.env.REDIS_USERNAME,
		password: process.env.REDIS_PASSWORD,
		port: parseInt(process.env.REDIS_PORT!)
	}
})

worker.on('failed', failedEventHandler)

worker.on('error', (error) => {
	console.error(error)
})
