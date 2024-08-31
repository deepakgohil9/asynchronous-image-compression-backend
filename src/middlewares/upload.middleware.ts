import multer, { type FileFilterCallback } from 'multer'
import multerS3 from 'multer-s3'
import { S3Client } from '@aws-sdk/client-s3'
import path from 'path'
import { HttpException, httpErrors } from '../utils/HttpException'

const randomString = (): string => Math.random().toString(36).substring(7)

const s3 = new S3Client({
	region: process.env.AWS_REGION!,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
})

const s3Storage = multerS3({
	s3: s3,
	bucket: process.env.BUCKET_NAME!,
	contentType: multerS3.AUTO_CONTENT_TYPE,
	key: (req, file, cb) => {
		cb(null, `uploads/${Date.now().toString()}-${file.originalname}-${randomString()}`)
	},
})

const sanitizeFile = (file: Express.Multer.File, cb: FileFilterCallback): void => {
	const fileExts = ['.csv']
	const ext = path.extname(file.originalname).toLowerCase()
	if (fileExts.includes(ext)) {
		return cb(null, true)
	}
	else {
		return cb(new HttpException(httpErrors.BAD_REQUEST, 'File type not supported'))
	}
}

const upload = multer({
	storage: s3Storage,
	fileFilter: (req, file, cb: FileFilterCallback) => {
		sanitizeFile(file, cb)
	}
})

export default upload
