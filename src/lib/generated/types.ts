// Code generated by tygo. DO NOT EDIT.
import { PlatformUser } from "./eureka-dovewing"
import * as ext from "./ext"
import * as discordgo from "./discordgo"
import * as silverpelt from "./silverpelt"

//////////
// source: apps.go

export interface Question {
  id: string;
  question: string;
  paragraph: string;
  placeholder: string;
  short: boolean;
}
export interface Position {
  id: string;
  tags: string[];
  info: string;
  name: string;
  questions: Question[];
  hidden: boolean;
  closed: boolean;
}
export interface AppMeta {
  positions: Position[];
  stable: boolean; // Stable means that the list of apps is not pending big changes
}
export interface AppResponse {
  app_id: string;
  user?: PlatformUser /* from eureka-dovewing.ts */;
  user_id: string;
  questions: Question[];
  answers: { [key: string]: string};
  state: string;
  created_at: string /* RFC3339 */;
  position: string;
  review_feedback?: string;
}
export interface AppListResponse {
  apps: AppResponse[];
}

//////////
// source: auth.go

export interface AuthorizeRequest {
  code: string;
  redirect_uri: string;
  protocol: string;
  scope: string;
}
export interface UserSession {
  id: string;
  name?: string;
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
  user_id: string;
  token: string;
  session_id: string;
  expiry: string /* RFC3339 */;
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
// source: commands.go

/**
 * PatchGuildModuleConfiguration allows updating the guild module configuration
 */
export interface PatchGuildCommandConfiguration {
  command: string;
  disabled?: Clearable<boolean>; // Whether or not the module is disabled or not. None means to use the default module configuration
  perms?: Clearable<any /* silverpelt.PermissionChecks */>; // The default permission checks of the module, can be overrided by the command configuration
}

//////////
// source: common.go

/**
 * API configuration data
 */
export interface ApiConfig {
  main_server: string;
  support_server_invite: string;
  client_id: string;
}
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
  context?: { [key: string]: string};
  message: string;
}
export interface ApiErrorWith<T extends any> {
  data?: T;
  context?: { [key: string]: string};
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
/**
 * A clearable is a value that can be either cleared or set
 */
export interface Clearable<T extends any> {
  clear: boolean;
  value?: T;
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
export interface GuildStaffTeam {
  members: GuildStaffMember[];
  roles: GuildStaffRoles[];
}
/**
 * Note: not all fields in `guild_members` are included
 */
export interface GuildStaffRoles {
  role_id: string;
  perms: string[];
  index: number /* int */;
  display_name?: string;
}
/**
 * Note: not all fields in `guild_members` are included
 */
export interface GuildStaffMember {
  user?: PlatformUser /* from eureka-dovewing.ts */;
  role: string[];
  public: boolean;
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
  context: { [key: string]: any};
  message: string;
}

//////////
// source: modules.go

/**
 * PatchGuildModuleConfiguration allows updating the guild module configuration
 */
export interface PatchGuildModuleConfiguration {
  module: string;
  disabled?: Clearable<boolean>; // Whether or not the module is disabled or not. None means to use the default module configuration
  default_perms?: Clearable<any /* silverpelt.PermissionChecks */>; // The default permission checks of the module, can be overrided by the command configuration
}

//////////
// source: settings.go

/**
 * SettingsExecute allows execution of a settings operation
 */
export interface SettingsExecute {
  operation: any /* silverpelt.CanonicalOperationType */;
  module: string;
  setting: string;
  fields: Record<string, any>;
}
/**
 * SettingsExecuteResponse is the response to a settings operation
 */
export interface SettingsExecuteResponse {
  fields: Record<string, any>[];
}
/**
 * SettingsGetSuggestions allows getting dynamic suggestions for a setting
 */
export interface SettingsGetSuggestions {
  operation: any /* silverpelt.CanonicalOperationType */;
  module: string;
  setting: string;
  column: string;
  filter?: string;
}
/**
 * SettingsGetSuggestionSuggestion is a suggestion for a setting
 */
export interface SettingsGetSuggestionSuggestion {
  id: any;
  value: any;
}
export interface SettingsGetSuggestionsResponse {
  suggestions: SettingsGetSuggestionSuggestion[];
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
  roles: ext.SerenityRole[];
  user_roles: string[];
  bot_roles: string[];
  channels: ext.GuildChannelWithPermissions[];
}
