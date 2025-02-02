/* eslint-disable no-console */
import dotenv from 'dotenv/config'
import express, { type Request, type Response } from 'express'
import helmet from 'helmet'
import xss from 'xss-shield'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import './worker'

import connect from './databases/mongo.database'
import errorHandler from './middlewares/errorHandler.middleware'
import sanitizer from './middlewares/sanitizer.middleware'

import batchRoute from './routes/batch.routes'

const PORT = process.env.PORT ?? 3000
const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }))
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
// app.use(xss.xssShield())
app.use(sanitizer)

app.use('/batch', batchRoute)

app.get('/', (req: Request, res: Response): void => { res.send({ message: '🚀 Hello! I am alive!' }) })
app.use((req: Request, res: Response): void => {
	res.send({ message: '🚧 Error 404: Requested endpoint not found.' })
})
app.use(errorHandler)

app.listen(PORT, (): void => {
	connect().then(() => {
		console.log(`🚀 Server is running at http://localhost:${PORT}`)
	}).catch((error) => {
		throw new Error(`❗Error connecting to the database: ${(error as Error).message}`)
	})
})
