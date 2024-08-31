import { Queue } from 'bullmq'

const queue = new Queue('compress', {
	connection: {
		host: process.env.REDIS_HOST,
		username: process.env.REDIS_USERNAME,
		password: process.env.REDIS_PASSWORD,
		port: parseInt(process.env.REDIS_PORT!)
	},
	defaultJobOptions: {
		removeOnComplete: true,
		removeOnFail: true,
	}
})

export default queue
