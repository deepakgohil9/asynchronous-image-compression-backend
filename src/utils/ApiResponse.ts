class ApiResponse<T> {
	public status: 'success' = 'success'
	public message: string
	public data?: Partial<T> | Partial<T>[]

	constructor (message: string, data?: Partial<T> | Partial<T>[]) {
		this.message = message
		this.data = data
	}
}

export default ApiResponse
