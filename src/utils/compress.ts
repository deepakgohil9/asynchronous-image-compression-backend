import sharp from 'sharp'

export default async (url: string) => {
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error('Error fetching image')
	}

	const buffer = await response.arrayBuffer()
	const compressedBuffer = await sharp(buffer)
		.resize({ fit: 'inside' })
		.jpeg({ quality: 30 })
		.toBuffer()

	return compressedBuffer
}

