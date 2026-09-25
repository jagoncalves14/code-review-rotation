const users = [
	{ id: 'profile-admin', name: 'Local Admin', is_admin: true, email: 'admin@example.com' },
	{ id: 'profile-alex', name: 'Alex Morgan', is_admin: false, email: 'alexmorgan@example.com' },
	{ id: 'profile-jamie', name: 'Jamie Chen', is_admin: false, email: 'jamiechen@example.com' },
	{ id: 'profile-sam', name: 'Sam Taylor', is_admin: false, email: 'samtaylor@example.com' },
]

export default defineEventHandler((event) => {
	const query = getQuery(event)
	const page = Number.parseInt(query.page as string) || 1
	const pageSize = Number.parseInt(query.pageSize as string) || 10
	const search = String(query.search ?? '').toLowerCase()
	const filteredUsers = users.filter(user => `${user.name} ${user.email}`.toLowerCase().includes(search))
	const from = (page - 1) * pageSize

	return {
		users: filteredUsers.slice(from, from + pageSize),
		count: filteredUsers.length,
	}
})
