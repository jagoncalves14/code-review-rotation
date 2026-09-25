import type {
	Database,
	Profile,
	Project,
	ProjectMember,
	Rotation,
	RotationAssignment,
	RotationHistory,
	UserPermission,
	UserWithEmail,
} from '@/types/supabase'

export interface LocalAuthUser {
	id: string
	email: string
}

type TableName = keyof Database['public']['Tables']
interface TableRow {
	profiles: Profile
	projects: Project
	rotations: Rotation
	rotation_assignments: RotationAssignment
	rotation_history: RotationHistory
	user_permissions: UserPermission
	project_members: ProjectMember
}

const STORAGE_KEY = 'code-reviewer-rotation.local.v1'
const SESSION_KEY = 'code-reviewer-rotation.local.session'
const now = new Date().toISOString()

const seed = {
	profiles: [
		{ id: 'profile-admin', name: 'Local Admin', is_admin: true, user_id: 'user-admin', created_at: now, updated_at: now },
		{ id: 'profile-alex', name: 'Alex Morgan', is_admin: false, user_id: 'user-alex', created_at: now, updated_at: now },
		{ id: 'profile-jamie', name: 'Jamie Chen', is_admin: false, user_id: 'user-jamie', created_at: now, updated_at: now },
		{ id: 'profile-sam', name: 'Sam Taylor', is_admin: false, user_id: 'user-sam', created_at: now, updated_at: now },
	] satisfies Profile[],
	projects: [
		{
			id: 'project-demo',
			name: 'Local Demo Project',
			description: 'Seeded project for local development.',
			rotation_period_days: 15,
			rotation_start_day: now.slice(0, 10),
			reviewers_count: 1,
			state: 'active',
			created_by: 'user-admin',
			created_at: now,
			updated_at: now,
		},
	] satisfies Project[],
	project_members: [
		{ id: 'member-alex', project_id: 'project-demo', profile_id: 'profile-alex', role: 'assignee', created_at: now },
		{ id: 'member-jamie', project_id: 'project-demo', profile_id: 'profile-jamie', role: 'assignee', created_at: now },
		{ id: 'member-sam', project_id: 'project-demo', profile_id: 'profile-sam', role: 'reviewer', created_at: now },
	] satisfies ProjectMember[],
	rotations: [],
	rotation_assignments: [],
	rotation_history: [],
	user_permissions: [
		{ id: 'permission-admin', user_id: 'user-admin', permission_level: 'edit', created_at: now, updated_at: now },
	] satisfies UserPermission[],
}

export type LocalDatabase = { [K in TableName]: TableRow[K][] }

function clone<T>(value: T): T {
	return structuredClone(value)
}

function createDatabase(): LocalDatabase {
	if (import.meta.client) {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored) {
			try {
				return JSON.parse(stored) as LocalDatabase
			} catch {
				localStorage.removeItem(STORAGE_KEY)
			}
		}
	}

	return clone(seed) as LocalDatabase
}

const database = createDatabase()

function persist() {
	if (import.meta.client) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(database))
	}
}

export function localRows<T extends TableName>(table: T): TableRow[T][] {
	return database[table] as TableRow[T][]
}

export function localReplace<T extends TableName>(table: T, rows: TableRow[T][]) {
	;(database as unknown as Record<TableName, unknown[]>)[table] = rows
	persist()
}

export function localId(prefix: string) {
	return `${prefix}-${crypto.randomUUID()}`
}

export function localUser(): LocalAuthUser | null {
	if (!import.meta.client) {
		return null
	}
	const stored = localStorage.getItem(SESSION_KEY)
	return stored ? JSON.parse(stored) as LocalAuthUser : null
}

export function setLocalUser(user: LocalAuthUser | null) {
	if (!import.meta.client) {
		return
	}
	if (user) {
		localStorage.setItem(SESSION_KEY, JSON.stringify(user))
	} else {
		localStorage.removeItem(SESSION_KEY)
	}
}

export function resetLocalDatabase() {
	localReplace('profiles', clone(seed.profiles))
	localReplace('projects', clone(seed.projects))
	localReplace('project_members', clone(seed.project_members))
	localReplace('rotations', clone(seed.rotations))
	localReplace('rotation_assignments', clone(seed.rotation_assignments))
	localReplace('rotation_history', clone(seed.rotation_history))
	localReplace('user_permissions', clone(seed.user_permissions))
}

export function localUsers(): UserWithEmail[] {
	return localRows('profiles').map(profile => ({
		id: profile.id,
		name: profile.name,
		is_admin: profile.is_admin ?? false,
		email: profile.id === 'profile-admin' ? 'admin@example.com' : `${profile.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
		created_at: profile.created_at,
		updated_at: profile.updated_at,
	}))
}
