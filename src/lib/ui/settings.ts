import { CanonicalColumn, CanonicalColumnType, CanonicalConfigOption, CanonicalInnerColumnType } from "$lib/generated/silverpelt";
import { ChannelConstraints } from "$lib/inputconstraints";
import { OperationTypes } from "../../components/settings/types";
import logger from "./logger";

export interface DispatchType {
    // The type of the input
    type: string;
    // The minimum length of the input
    minlength: number | undefined;
    // The maximum length of the input
    maxlength: number | undefined;
    // The allowed values of the input
    allowed_values: { [label: string]: string } | undefined;
    // If bitflag, then the values of the bitflag
    bitflag_values: { [label: string]: bigint } | undefined;
    // If channel, then the channelConstraints
    channel_constraints: ChannelConstraints | undefined;
    // Referenced variables (for dynamic columns)
    referenced_variables: string[];
    // Resolves column type
    resolved_column_type: CanonicalColumnType;
}

// Returns the type to be dispatched to InputDispatcher
export const getDispatchType = (fields: Record<string, any>, column: CanonicalColumn): DispatchType => {
    const _setOnDispatchType = <T extends keyof DispatchType>(
        dispatchType: DispatchType,
        key: T,
        value: DispatchType[T]
    ) => {
        if (!dispatchType[key] || (Array.isArray(dispatchType[key]) && dispatchType[key].length == 0)) {
            dispatchType[key] = value;
        }
        return dispatchType;
    };

    // Check for __{}_displaytype
    let dispatchType: DispatchType = {
        type: '',
        minlength: undefined,
        maxlength: undefined,
        allowed_values: undefined,
        bitflag_values: undefined,
        channel_constraints: undefined,
        referenced_variables: [],
        resolved_column_type: column.column_type,
    };

    const handleInner = (
        dispatchType: DispatchType,
        inner: CanonicalInnerColumnType
    ): DispatchType => {
        let key = Object.keys(inner)[0];

        switch (key) {
            case "String":
                if (!inner.String) throw new Error("String inner column type is undefined");
                _setOnDispatchType(dispatchType, 'minlength', inner.String.min_length);
                _setOnDispatchType(dispatchType, 'maxlength', inner.String.max_length);

                if (inner.String.allowed_values) {
                    // Set the allowed values
                    let allowedValues: { [label: string]: string } = {};
                    inner.String.allowed_values.forEach((value) => {
                        allowedValues[value] = value;
                    });
                    _setOnDispatchType(dispatchType, 'allowed_values', allowedValues);
                }

                if (!inner.String.kind) {
                    _setOnDispatchType(dispatchType, 'type', 'string');
                    break;
                }

                if (Object.keys(inner.String.kind).length < 1) {
                    _setOnDispatchType(dispatchType, 'type', 'string');
                    break;
                }

                // Handle the kind
                if (inner.String.kind.Normal) _setOnDispatchType(dispatchType, 'type', 'string');
                else if (inner.String.kind.Template) _setOnDispatchType(
                    dispatchType,
                    'type',
                    inner.String.kind.Template.kind ? `string:${Object.keys(inner.String.kind)[0]?.toLowerCase()}:${Object.keys(inner.String.kind.Template.kind)[0]?.toLowerCase()}` : 'string:template'
                );
                else if (inner.String.kind.Channel) {
                    _setOnDispatchType(
                        dispatchType,
                        'type',
                        "string:channel"
                    );
                    _setOnDispatchType(
                        dispatchType,
                        'channel_constraints',
                        {
                            allowed_types: inner.String.kind.Channel.allowed_types,
                            needed_bot_permissions: inner.String.kind.Channel.needed_bot_permissions
                        }
                    );
                }
                else _setOnDispatchType(
                    dispatchType,
                    'type',
                    inner.String.kind ? `string:${Object.keys(inner.String.kind)[0]?.toLowerCase()}` : 'string'
                );
                break;
            case "BitFlag":
                if (!inner.BitFlag) throw new Error("BitFlag inner column type is undefined");
                _setOnDispatchType(dispatchType, 'type', 'bitflag');

                // Until the rust server code can handle bigint correctly, convert them here ourselves
                let values: { [label: string]: bigint } = {};

                Object.keys(inner.BitFlag.values).forEach((value) => {
                    if (!inner.BitFlag) return; // TS can't infer that inner.BitFlag is still not null here
                    values[value] = BigInt(inner.BitFlag.values[value]);
                });

                _setOnDispatchType(dispatchType, 'bitflag_values', values);
            default:
                _setOnDispatchType(dispatchType, 'type', key.toLowerCase());
                break;
        }

        return dispatchType;
    };

    // First handle dynamic (and nested dynamic too!)
    while (dispatchType.resolved_column_type.Dynamic) {
        let found = false;
        for (let clause of dispatchType.resolved_column_type.Dynamic.clauses) {
            let value = templateToStringLite(clause.field, fields);
            dispatchType.referenced_variables = dispatchType.referenced_variables.concat(getReferencedVariables(clause.field));
            if (value == clause.value) {
                dispatchType.resolved_column_type = clause.column_type;
                found = true;
            }
        }

        if (!found) {
            break;
        }
    }

    if (dispatchType.resolved_column_type.Scalar) {
        return handleInner(dispatchType, dispatchType.resolved_column_type.Scalar.column_type);
    } else if (dispatchType.resolved_column_type.Array) {
        return handleInner(dispatchType, dispatchType.resolved_column_type.Array.inner);
    } else {
        return dispatchType;
    }
};

export enum ColumnState {
    Hidden,
    Disabled,
    Enabled
}

export const deriveColumnState = (
    configOpt: CanonicalConfigOption,
    column: CanonicalColumn,
    operationType: OperationTypes
): ColumnState => {
    if (operationType == 'View') {
        return ColumnState.Disabled; // View means read-only
    }

    if (column.ignored_for.includes(operationType)) {
        // Special case for Create operation, if create, the column is hidden to improve UX
        if (operationType == 'Create') {
            return ColumnState.Hidden;
        }
        return ColumnState.Disabled; // Ignored for this operation
    }

    // If primary key and not Create, then also yes
    if (operationType != 'Create' && column.id == configOpt.primary_key) {
        return ColumnState.Disabled;
    }

    return ColumnState.Enabled;
};

/**
 * Returns a list of variables that were referenced in a template
 */
export const getReferencedVariables = (template: string): string[] => {
    let variables: string[] = [];
    let inVariable = false;
    let variable = '';
    for (let i = 0; i < template.length; i++) {
        if (template[i] == '{') {
            inVariable = true;
            continue;
        }

        if (template[i] == '}') {
            inVariable = false;
            variables.push(variable);
            variable = '';
            continue;
        }

        if (inVariable) {
            variable += template[i];
        }
    }

    return variables;
}

/**
 * Lite version of the Rust template_to_string. In particular, this implementation does not provide special variables
 */
export const templateToStringLite = (template: string, fields: Record<string, any>) => {
    if (template.startsWith("{") && template.endsWith("}")) {
        let possibleVarName = template.substring(1, template.length - 1);
        if (fields[possibleVarName]) return fields[possibleVarName];
    }

    let nt = template;
    for (const key in fields) {
        logger.debug('Setting.templateToStringLite', 'Replacing', key, fields[key], fields);
        nt = nt.replaceAll(`{${key}}`, fields[key]);
    }

    return nt;
};
