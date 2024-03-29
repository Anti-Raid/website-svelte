// Code generated by tygo. DO NOT EDIT.
import { PlatformUser } from './eureka-dovewing';
import * as ext from './ext';
import * as silverpelt from './silverpelt';

//////////
// source: auth.go

export interface AuthorizeRequest {
	code: string;
	redirect_uri: string;
	protocol: string;
	scope: string;
}
export interface UserLogin {
	token: string;
	user_id: string;
}
export interface UserSession {
	id: string;
	name?: string | null /* nullable */;
	user_id: string;
	created_at: string /* RFC3339 */;
	type: string;
	perm_limits: string[];
	expiry: string /* RFC3339 */;
}
export interface CreateUserSession {
	name: string;
	type: string;
	perm_limits: string[];
	expiry: number /* int64 */;
}
export interface CreateUserSessionResponse {
	token: string;
	session_id: string;
}
export interface UserSessionList {
	sessions: (UserSession | undefined)[];
}
export interface TestAuth {
	auth_type: string;
	target_id: string;
	token: string;
}

//////////
// source: common.go

export const TargetTypeUser = 'User';
export const TargetTypeServer = 'Server';
/**
 * A link is any extra link
 */
export interface Link {
	name: string;
	value: string;
}
/**
 * SEO object (minified bot/user/server for seo purposes)
 */
export interface SEO {
	name: string;
	id: string;
	avatar: string;
	short: string;
}
/**
 * This represents a IBL Popplio API Error
 */
export interface ApiError {
	context?: { [key: string]: string };
	message: string;
}
export interface ApiErrorWith<T extends any> {
	data?: T;
	context?: { [key: string]: string };
	message: string;
}
/**
 * Paged result common
 */
export interface PagedResult<T extends any> {
	count: number /* uint64 */;
	per_page: number /* uint64 */;
	results: T;
}
export interface Vanity {
	itag: string /* uuid */;
	target_id: string;
	target_type: string;
	code: string;
	created_at: string /* RFC3339 */;
}

//////////
// source: guild.go

export interface DashboardGuild {
	id: string;
	name: string;
	avatar: string;
	permissions: number /* int64 */;
}
export interface DashboardGuildData {
	guilds: (DashboardGuild | undefined)[];
	has_bot: string[];
	unknown_guilds: string[];
}

//////////
// source: ioauth.go

export interface IOAuthRedirect {
	dest: string;
	scopes: string[];
}
export interface IOAuthOutput {
	access_token: string;
	refresh_token: string;
	expires_in: number /* int */; // Seconds
	scope: string; // Scopes as returned by discord
	scopes: string[]; // Scopes as a slice
	discord_user?: any /* discordgo.User */; // The discord user
	user_guilds?: (any /* discordgo.UserGuild */ | undefined)[]; // The guilds the user is in if 'guilds' is in the scopes
}
export interface IOAuthDiscordError {
	context: { [key: string]: any };
	message: string;
}

//////////
// source: task.go

/**
 * TaskCreateResponse is the response upon creating a task
 */
export interface TaskCreateResponse {
	task_id: string;
	task_info?: TaskInfo;
}
/**
 * @ci table=tasks unfilled=1
 * Tasks are background processes that can be run on a coordinator server.
 */
export interface PartialTask {
	task_id: string;
	task_name: string;
	expiry?: any /* time.Duration */;
	state: string;
	created_at: string /* RFC3339 */;
}
export interface TaskListResponse {
	tasks: PartialTask[];
}
/**
 * @ci table=tasks
 * Tasks are background processes that can be run on a coordinator server.
 */
export interface Task {
	task_id: string;
	task_name: string;
	output?: TaskOutput;
	task_info?: TaskInfo;
	statuses: { [key: string]: any }[];
	task_for?: TaskFor;
	expiry?: any /* time.Duration */;
	state: string;
	created_at: string /* RFC3339 */;
}
/**
 * TaskFor is a struct containing the internal representation of who a task is for
 */
export interface TaskFor {
	id: string;
	target_type: string;
}
/**
 * TaskOutput is the output of a task
 */
export interface TaskOutput {
	filename: string;
	segregated: boolean; // If this flag is set, then the stored output will be stored in $taskForSimplexFormat/$taskName/$taskId/$filename instead of $taskId/$filename
}
/**
 * Information on a task
 */
export interface TaskInfo {
	name: string;
	task_for?: TaskFor;
	task_fields: any;
	expiry: any /* time.Duration */;
	resumable: boolean;
	valid: boolean;
}

//////////
// source: users.go

/**
 * Represents a user on Antiraid
 */
export interface User {
	user?: PlatformUser /* from eureka-dovewing.ts */;
	state: string;
	vote_banned: boolean;
	created_at: string /* RFC3339 */;
	updated_at: string /* RFC3339 */;
}
export interface UserGuildBaseData {
	owner_id: string;
	name: string;
	icon?: string;
	roles: { [key: string]: any /* ext.SerenityRole */ | undefined };
	user_roles: string[];
	bot_roles: string[];
}
