<script lang="ts">
	import {
		CanonicalColumn,
		CanonicalConfigOption,
		CanonicalInnerColumnType,
		CanonicalModule,
		CanonicalOperationType
	} from '$lib/generated/silverpelt';
	import { SettingsExecuteResponse } from '$lib/generated/types';
	import Label from '../../../../components/inputs/Label.svelte';
	import SettingsSuggestionBox from './SettingsSuggestionBox.svelte';
	import { OperationTypes } from './types';

	export let configOpt: CanonicalConfigOption;
	export let module: CanonicalModule;
	export let guildId: string;
	export let settings: SettingsExecuteResponse;

	const getDisplayType = (fields: Record<string, any>, column: CanonicalColumn): string => {
		// Check for __{}_displaytype

		/*
            "channel" => return format!("<#{}>", value),
            "role" => return format!("<@&{}>", value),
            "user" => return format!("<@{}>", value),
        */

		if (fields[`__${column.id}_displaytype`]) {
			return fields[`__${column.id}_displaytype`];
		}

		const getInnerColumnTypeString = (inner: CanonicalInnerColumnType) => {
			/*
#[derive(Debug, Clone, PartialEq)]
#[allow(dead_code)]
pub enum InnerColumnType {
    Uuid {},
    String {
        min_length: Option<usize>,
        max_length: Option<usize>,
        allowed_values: Vec<&'static str>, // If empty, all values are allowed
        kind: InnerColumnTypeStringKind,
    },
    Timestamp {},
    TimestampTz {},
    Integer {},
    Float {},
    BitFlag {
        /// The bit flag values
        values: indexmap::IndexMap<&'static str, i64>,
    },
    Boolean {},
    Json {},
}
            */

			if (inner.String) {
				// Handle the kind
				if (inner.String.kind == 'Normal') {
					return 'string';
				} else if (inner.String.kind == 'User') {
					return 'user';
				} else if (inner.String.kind == 'Channel') {
					return 'channel';
				} else if (inner.String.kind == 'Role') {
					return 'role';
				} else if (inner.String.kind == 'Emoji') {
					return 'emoji';
				} else if (inner.String.kind == 'Message') {
					return 'message';
				} else {
					return inner.String.kind?.toLowerCase() || 'string';
				}
			} else if (inner.Uuid) {
				return 'uuid';
			} else if (inner.Timestamp) {
				return 'timestamp';
			} else if (inner.TimestampTz) {
				return 'timestamptz';
			} else if (inner.Integer) {
				return 'integer';
			} else if (inner.Float) {
				return 'float';
			} else if (inner.Boolean) {
				return 'boolean';
			} else if (inner.BitFlag) {
				return 'bitflag';
			} else if (inner.Json) {
				return 'json';
			} else {
				return Object.keys(inner)[0].toLowerCase();
			}
		};

		if (column.column_type.Scalar) {
			return getInnerColumnTypeString(column.column_type.Scalar.column_type);
		} else if (column.column_type.Array) {
			return getInnerColumnTypeString(column.column_type.Array.inner);
		} else {
			return 'unknown';
		}
	};

	const shouldColumnBeDisabled = (
		column: CanonicalColumn,
		operationType: OperationTypes
	): boolean => {
		if (operationType == 'View') {
			return true; // View means read-only
		}

		if (column.ignored_for.includes(operationType)) {
			return false;
		}

		return true;
	};
</script>

{#each settings?.fields || [] as columnField}
	{#each configOpt.columns as column}
		<Label id={column.id} label={column.name} />

		<SettingsSuggestionBox
			{guildId}
			module={module.id}
			{configOpt}
			{column}
			operationType={'Update'}
			bind:value={columnField[column.id]}
		>
			Value: {columnField[column.id]}
		</SettingsSuggestionBox>

		<p class="configopt__debuginfo">
			{column.name} - {getDisplayType(columnField, column)} - View: {shouldColumnBeDisabled(
				column,
				'View'
			)}, Update: {shouldColumnBeDisabled(column, 'Update')}, Create: {shouldColumnBeDisabled(
				column,
				'Create'
			)}, Delete: {shouldColumnBeDisabled(column, 'Delete')}, isPkey: {column.id ==
				configOpt.primary_key}
		</p>
	{/each}
{/each}
