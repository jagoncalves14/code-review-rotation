export default eventHandler(async (event) => {
	const body = await readBody<{ userId?: string }>(event)
	return { success: Boolean(body?.userId) }
})
