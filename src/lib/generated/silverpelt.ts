// Code generated by tygo. DO NOT EDIT.

//////////
// source: silverpelt.go

export interface PermissionCheck {
  kittycat_perms: string[];
  native_perms: string[];
  outer_and: boolean;
  inner_and: boolean;
}
export interface PermissionChecks {
  checks: PermissionCheck[];
  checks_needed: number /* int */;
}
export interface CanonicalCommandExtendedData {
  id: string;
  default_perms: PermissionChecks;
}
export interface CanonicalModule {
  id: string;
  name: string;
  description: string;
  configurable: boolean;
  commands_configurable: boolean;
  web_hidden: boolean;
  is_default_enabled: boolean;
  commands: CanonicalCommand[];
}
export interface CanonicalCommand {
  command: CanonicalCommandData;
  extended_data: CanonicalCommandExtendedData[];
}
export interface CanonicalCommandArgument {
  name: string;
  description?: string;
  required: boolean;
  choices: string[];
}
export interface CanonicalCommandData {
  name: string;
  qualified_name: string;
  description?: string;
  nsfw: boolean;
  subcommands: CanonicalCommandData[];
  subcommand_required: boolean;
  arguments: CanonicalCommandArgument[];
}
