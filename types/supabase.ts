// Reusable timestamp fields
interface TimestampFields {
	created_at: string
	updated_at: string
}

// Profile definitions
export interface Profile extends TimestampFields {
	id: string
	name: string
	is_admin: boolean
	user_id: string | null
}

export interface ProfileInsert {
	name: string
	is_admin?: boolean
	user_id?: string | null
}

export interface ProfileUpdate {
	name?: string
	is_admin?: boolean
	user_id?: string | null
}

// Project definitions
export type ProjectState = 'draft' | 'active' | 'inactive'

export interface Project extends TimestampFields {
	id: string
	name: string
	rotation_period_days: number
	rotation_start_day: string
	reviewers_count: number
	state: ProjectState
	description?: string | null
	created_by: string | null
}

export interface ProjectInsert {
	name: string
	rotation_period_days?: number
	rotation_start_day: string
	reviewers_count?: number
	state: ProjectState
	description?: string | null
	created_by?: string | null
}

export interface ProjectUpdate {
	name?: string
	rotation_period_days?: number
	rotation_start_day?: string
	reviewers_count?: number
	state?: ProjectState
	description?: string | null
}

// Rotation definitions
export interface Rotation {
	id: string
	project_id: string
	start_date: string
	end_date: string
	manually_triggered: boolean
	is_final: boolean
	created_at: string
}

export interface RotationInsert {
	project_id: string
	start_date: string
	end_date: string
	manually_triggered?: boolean
	is_final?: boolean
}

export interface RotationUpdate {
	start_date?: string
	end_date?: string
	manually_triggered?: boolean
	is_final?: boolean
}

// Rotation Assignment definitions
export interface RotationAssignment {
	id: string
	rotation_id: string
	assignee_profile_id: string
	reviewer_profile_id: string
}

export interface RotationAssignmentInsert {
	rotation_id: string
	assignee_profile_id: string
	reviewer_profile_id: string
}

export interface RotationAssignmentUpdate {
	rotation_id?: string
	assignee_profile_id?: string
	reviewer_profile_id?: string
}

// Rotation History definitions
export interface RotationHistory {
	id: string
	project_id: string
	rotation_date: string
	snapshot: Record<string, any>
	created_at: string
}

export interface RotationHistoryInsert {
	project_id: string
	rotation_date: string
	snapshot: Record<string, any>
}

export interface RotationHistoryUpdate {
	rotation_date?: string
	snapshot?: Record<string, any>
}

// User Permission definitions
export type PermissionLevel = 'view' | 'edit'

export interface UserPermission extends TimestampFields {
	id: string
	user_id: string
	permission_level: PermissionLevel
}

export interface UserPermissionInsert {
	user_id: string
	permission_level: PermissionLevel
}

export interface UserPermissionUpdate {
	permission_level?: PermissionLevel
}

// Project Member definitions
export type MemberRole = 'assignee' | 'reviewer'

export interface ProjectMember {
	id: string
	project_id: string
	profile_id: string
	role: MemberRole
	created_at: string
}

export interface ProjectMemberInsert {
	project_id: string
	profile_id: string
	role: MemberRole
}

export interface ProjectMemberUpdate {
	role?: MemberRole
}

// User with Email (from RPC function)
export interface UserWithEmail extends TimestampFields {
	id: string
	name: string
	email: string
	is_admin: boolean
}

// Database schema definition
export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: Profile
				Insert: ProfileInsert
				Update: ProfileUpdate
			}
			projects: {
				Row: Project
				Insert: ProjectInsert
				Update: ProjectUpdate
			}
			rotations: {
				Row: Rotation
				Insert: RotationInsert
				Update: RotationUpdate
			}
			rotation_assignments: {
				Row: RotationAssignment
				Insert: RotationAssignmentInsert
				Update: RotationAssignmentUpdate
			}
			rotation_history: {
				Row: RotationHistory
				Insert: RotationHistoryInsert
				Update: RotationHistoryUpdate
			}
			user_permissions: {
				Row: UserPermission
				Insert: UserPermissionInsert
				Update: UserPermissionUpdate
			}
			project_members: {
				Row: ProjectMember
				Insert: ProjectMemberInsert
				Update: ProjectMemberUpdate
			}
		}
		Functions: {
			get_users_with_emails: {
				Args: Record<string, never>
				Returns: UserWithEmail[]
			}
		}
	}
}
