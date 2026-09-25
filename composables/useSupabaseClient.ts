import type { Database } from '@/types/supabase'
import type { LocalAuthUser } from '@/utils/local-dev-store'
import {
	localId,
	localReplace,
	localRows,
	localUser,
	localUsers,
	setLocalUser,
} from '@/utils/local-dev-store'
import { setSupabaseUser } from './useSupabaseUser'

type TableName = keyof Database['public']['Tables']
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']
type Row = Record<string, unknown>
type QueryValue<T> = T[] & T

interface QueryResult<T = Row> {
	data: QueryValue<T>
	error: Error | null
	count?: number
}

function createError<T = Row>(message: string): QueryResult<T> {
	return { data: null as unknown as QueryValue<T>, error: new Error(message) }
}

class LocalQuery<T extends TableName> implements PromiseLike<QueryResult<TableRow<T>>> {
	private filters: Array<(row: Row) => boolean> = []
	private selected = '*'
	private operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select'
	private payload: Row | Row[] | null = null
	private orderBy: { column: string, ascending: boolean } | null = null
	private rangeStart: number | null = null
	private rangeEnd: number | null = null
	private returnInserted = false
	private singleResult = false
	private maybeSingleResult = false
	private countRequested = false

	constructor(private readonly table: T) {}

	select(columns = '*', options?: { count?: 'exact' }) {
		this.selected = columns
		if (this.operation === 'select') {
			this.operation = 'select'
		} else {
			this.returnInserted = true
		}
		this.countRequested = options?.count === 'exact'
		return this
	}

	insert(payload: object | object[]) {
		this.operation = 'insert'
		this.payload = payload as Row | Row[]
		return this
	}

	update(payload: object) {
		this.operation = 'update'
		this.payload = payload as Row
		return this
	}

	upsert(payload: object, _options?: { onConflict?: string }) {
		this.operation = 'upsert'
		this.payload = payload as Row
		return this
	}

	in(column: string, values: unknown[]) {
		this.filters.push(row => values.includes(row[column]))
		return this
	}

	delete() {
		this.operation = 'delete'
		return this
	}

	eq(column: string, value: unknown) {
		this.filters.push(row => row[column] === value)
		return this
	}

	ilike(column: string, pattern: string) {
		const search = pattern.replace(/^%|%$/g, '').toLowerCase()
		this.filters.push(row => String(row[column] ?? '').toLowerCase().includes(search))
		return this
	}

	order(column: string, options?: { ascending?: boolean }) {
		this.orderBy = { column, ascending: options?.ascending ?? true }
		return this
	}

	range(from: number, to: number) {
		this.rangeStart = from
		this.rangeEnd = to
		return this
	}

	single() {
		this.singleResult = true
		return this
	}

	maybeSingle() {
		this.maybeSingleResult = true
		return this
	}

	then<TResult1 = QueryResult<TableRow<T>>, TResult2 = never>(
		onfulfilled?: ((value: QueryResult<TableRow<T>>) => TResult1 | PromiseLike<TResult1>) | null,
		onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
	): Promise<TResult1 | TResult2> {
		return this.execute().then(onfulfilled, onrejected)
	}

	private async execute(): Promise<QueryResult<TableRow<T>>> {
		const rows = localRows(this.table) as unknown as Row[]

		if (this.operation === 'select') {
			let result = rows.filter(row => this.filters.every(filter => filter(row)))
			if (this.orderBy) {
				const { column, ascending } = this.orderBy
				result = [...result].sort((left, right) => {
					const comparison = String(left[column] ?? '').localeCompare(String(right[column] ?? ''))
					return ascending ? comparison : -comparison
				})
			}
			const count = result.length
			if (this.rangeStart !== null && this.rangeEnd !== null) {
				result = result.slice(this.rangeStart, this.rangeEnd + 1)
			}
			result = this.project(result)
			if (this.singleResult || this.maybeSingleResult) {
				if (result.length === 0 && this.singleResult) {
					return createError<TableRow<T>>(`${this.table} row not found`)
				}
				if (result.length > 1 && this.singleResult) {
					return createError<TableRow<T>>(`Multiple ${this.table} rows found`)
				}
				return { data: result[0] ?? null, error: null, ...(this.countRequested ? { count } : {}) } as unknown as QueryResult<TableRow<T>>
			}
			return { data: result, error: null, ...(this.countRequested ? { count } : {}) } as unknown as QueryResult<TableRow<T>>
		}

		if (this.operation === 'delete') {
			localReplace(this.table, rows.filter(row => !this.filters.every(filter => filter(row))) as never[])
			return { data: null, error: null } as unknown as QueryResult<TableRow<T>>
		}

		const payloads = Array.isArray(this.payload) ? this.payload : [this.payload ?? {}]
		if (this.operation === 'insert') {
			const inserted = payloads.map(payload => this.withDefaults(payload))
			localReplace(this.table, [...rows, ...inserted] as never[])
			return { data: this.returnInserted ? this.project(inserted) : null, error: null } as unknown as QueryResult<TableRow<T>>
		}

		if (this.operation === 'upsert') {
			const conflictKey = 'user_id'
			const upserted = this.withDefaults(payloads[0])
			const index = rows.findIndex(row => row[conflictKey] === upserted[conflictKey])
			if (index >= 0) {
				rows[index] = { ...rows[index], ...upserted }
			} else {
				rows.push(upserted)
			}
			localReplace(this.table, rows as never[])
			return { data: null, error: null } as unknown as QueryResult<TableRow<T>>
		}

		const matches = rows.filter(row => this.filters.every(filter => filter(row)))
		matches.forEach(row => Object.assign(row, this.payload ?? {}, { updated_at: new Date().toISOString() }))
		localReplace(this.table, rows as never[])
		return { data: this.returnInserted ? this.project(matches) : null, error: null } as unknown as QueryResult<TableRow<T>>
	}

	private withDefaults(payload: Row): Row {
		const timestamp = new Date().toISOString()
		return {
			id: payload.id ?? localId(this.table),
			created_at: payload.created_at ?? timestamp,
			updated_at: payload.updated_at ?? timestamp,
			...payload,
		}
	}

	private project(rows: Row[]): Row[] {
		if (this.selected === '*') {
			return rows
		}
		const columns = this.selected.split(',').map(column => column.trim())
		return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
	}
}
interface LocalAuth {
	signInWithPassword: (credentials: { email: string, password: string }) => Promise<{ data: { user: LocalAuthUser | null }, error: Error | null }>
	signUp: (credentials: { email: string, password: string }) => Promise<{ data: { user: (LocalAuthUser & { identities: object[] }) | { identities: never[] } }, error: Error | null }>
	signOut: () => Promise<{ error: Error | null }>
	getUser: () => Promise<{ data: { user: LocalAuthUser | null }, error: Error | null }>
	updateUser: (update: { email?: string, password?: string }) => Promise<{ data: { user: LocalAuthUser | null }, error: Error | null }>
	resetPasswordForEmail: (email: string, options?: { redirectTo?: string }) => Promise<{ data: object, error: Error | null }>
}
function createUser(email: string): LocalAuthUser {
	return { id: localUsers().find(user => user.email === email)?.id ?? localId('user'), email }
}

export function useSupabaseClient<TDatabase = Database>() {
	void (undefined as TDatabase | undefined)
	return {
		from<T extends TableName>(table: T) {
			return new LocalQuery<T>(table)
		},
		rpc(name: string) {
			return name === 'get_users_with_emails'
				? new LocalRpcQuery(localUsers())
				: new LocalRpcQuery([])
		},
		auth: {
			async signInWithPassword(credentials: { email: string, password: string }) {
				const valid = credentials.email === 'admin@example.com' && credentials.password === 'password'
				if (!valid) {
					return { data: { user: null }, error: new Error('Invalid login credentials') }
				}
				const user = createUser(credentials.email)
				setLocalUser(user)
				setSupabaseUser(user)
				return { data: { user }, error: null }
			},
			async signUp(credentials: { email: string, password: string }) {
				if (localUsers().some(user => user.email === credentials.email)) {
					return { data: { user: { identities: [] } }, error: null }
				}
				const user = createUser(credentials.email)
				await new LocalQuery('profiles')
					.insert({ id: user.id, name: credentials.email.split('@')[0], user_id: user.id, is_admin: false })
				return { data: { user: { ...user, identities: [{}] } }, error: null }
			},
			async signOut() {
				setLocalUser(null)
				setSupabaseUser(null)
				return { error: null }
			},
			async getUser() {
				return { data: { user: localUser() }, error: null }
			},
			async updateUser(update: { email?: string, password?: string }) {
				const user = localUser()
				const updatedUser = user && update.email ? { ...user, email: update.email } : user
				if (updatedUser) {
					setLocalUser(updatedUser)
					setSupabaseUser(updatedUser)
				}
				return { data: { user: updatedUser }, error: null }
			},
			async resetPasswordForEmail(_email: string, _options?: { redirectTo?: string }) {
				return { data: {}, error: null }
			},
		} as LocalAuth,
	}
}

class LocalRpcQuery<T extends object> implements PromiseLike<QueryResult<T>> {
	private filters: Array<(row: Row) => boolean> = []
	private singleResult = false

	constructor(private readonly rows: T[]) {}

	eq(column: string, value: unknown) {
		this.filters.push(row => row[column] === value)
		return this
	}

	single() {
		this.singleResult = true
		return this
	}

	then<TResult1 = QueryResult<T>, TResult2 = never>(
		onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
		onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
	): Promise<TResult1 | TResult2> {
		const rows = this.rows.filter(row => this.filters.every(filter => filter(row as Row)))
		const result = this.singleResult ? rows[0] ?? null : rows
		const response = this.singleResult && !result
			? createError<T>('Row not found')
			: { data: result as unknown as QueryValue<T>, error: null }
		return Promise.resolve(response).then(onfulfilled, onrejected)
	}
}
