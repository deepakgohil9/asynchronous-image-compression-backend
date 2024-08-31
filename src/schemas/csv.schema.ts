import { object, number, string, type TypeOf } from 'zod'

export const inputCsvSchema = object({
	'S. No.': number(),
	'Product Name': string(),
	'Input Image Urls': string().array()
})

export type InputCsvSchemaType = TypeOf<typeof inputCsvSchema>
