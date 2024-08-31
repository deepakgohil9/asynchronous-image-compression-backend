import { object, string, type TypeOf } from 'zod'

export const getBatchSchema = object({
	body: object({}).strict(),
	query: object({}).strict(),
	params: object({
		id: string().regex(/^[0-9a-f]{24}$/)
	}).strict()
})

// Following are the types of the above schemas used to pass to the generic Req type in the controller
export type GetBatchSchemaType = TypeOf<typeof getBatchSchema>
