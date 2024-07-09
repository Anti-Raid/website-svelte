import { CanonicalCommandExtendedData } from "$lib/converters";
import { CanonicalModule, CanonicalCommandData, GuildCommandConfiguration, CommandExtendedData } from "$lib/generated/silverpelt";
import { permuteCommands } from "$lib/mewext/mewext";
import logger from "./logger";

export interface LookedUpCommand {
    command: ParsedCanonicalCommandData;
    module: CanonicalModule;
}

export const commandLookup = (clusterModules: Record<string, CanonicalModule>, query: string): LookedUpCommand[] => {
    let moduleData = clusterModules;
    if (!moduleData) return [];

    let commands: LookedUpCommand[] = [];

    for (let module of Object.values(moduleData)) {
        let extractedCommands = extractCommandsFromModule(module);

        for (let command of extractedCommands) {
            if (
                command?.full_name?.includes(query.toLowerCase())
            ) {
                commands.push({
                    command: command,
                    module
                });
            }
        }
    }

    return commands;
};

export interface ParsedCanonicalCommandData extends CanonicalCommandData {
    subcommand_depth: number;
    parent_command?: CanonicalCommandData;
    /**
     * The extended data of the command itself
     */
    extended_data: CanonicalCommandExtendedData;
    extended_data_map: Record<string, CanonicalCommandExtendedData>;
    search_permissions: string;
    full_name: string;
}

export const extractCommandsFromModule = (module: CanonicalModule): ParsedCanonicalCommandData[] => {
    let commands: ParsedCanonicalCommandData[] = [];

    // Recursively parse commands
    const parseCommand = (
        command: CanonicalCommandData,
        extended_data: Record<string, CanonicalCommandExtendedData>,
        depth: number = 0,
        parent: CanonicalCommandData | undefined
    ) => {
        let extData = extended_data[depth == 0 ? '' : command?.name] || extended_data[''];
        logger.info('ParseCommand', 'Parsing command', command?.name, depth, parent, extData);
        commands.push({
            ...command,
            subcommand_depth: depth,
            parent_command: parent,
            extended_data: extData,
            extended_data_map: extended_data,
            search_permissions: extData?.default_perms?.checks
                ?.map((check) => check?.kittycat_perms)
                ?.join(', '),
            full_name: depth == 0 ? command?.name : `${parent?.name} ${command?.name}`
        });

        if (command?.subcommands) {
            for (let subcommand of command?.subcommands) {
                parseCommand(subcommand, extended_data, depth + 1, command);
            }
        }
    };

    for (let command of module?.commands) {
        let extData: Record<string, CanonicalCommandExtendedData> = {};

        for (let id in command?.extended_data) {
            extData[id] = {
                id,
                ...command?.extended_data[id]
            };
        }

        logger.info('ParseCommand.ExtData', 'Got extended data', extData);

        parseCommand(command?.command, extData, 0, undefined);
    }

    return commands;
};

/**
 * Derives a list of command configurations for a certain command
 * 
 * @param clusterModules The modules available on the cluster. Used as a fallback when a command configuration is not explicitly set.
 * @param currentCommandConfiguration The current full list of command configurations for the guild
 * @param guildId The guild ID
 * @param command The command to get configurations for
 * @returns 
 */
export const getCommandConfigurations = (clusterModules: Record<string, CanonicalModule>, currentCommandConfiguration: GuildCommandConfiguration[], guildId: string, command: string): GuildCommandConfiguration[] => {
    let ccs = []; // List of command configurations to return

    let permuted_commands = permuteCommands(command);
    let base_command = permuted_commands[0];

    logger.info(
        'GetCommandConfigurations',
        'Getting command configurations for',
        command,
        permuted_commands,
        base_command
    );

    // For each permuted command, find the command configuration
    for (let permuted_command of permuted_commands) {
        let cc = currentCommandConfiguration.find((cmc) => cmc.command == permuted_command);

        if (cc) {
            ccs.push(cc);
            continue;
        }

        // Fallback
        let ncc: GuildCommandConfiguration = {
            id: '',
            guild_id: guildId,
            command: permuted_command,
        };
        ccs.push(ncc);
    }

    logger.info('GetCommandConfigurations', 'Got command configs [ccs]', {
        base_command,
        permuted_commands,
        ccs
    });

    return ccs;
};

export const getCommandExtendedData = (parsedCommands: ParsedCanonicalCommandData[], command: string): CommandExtendedData => {
    let permuted_commands = permuteCommands(command);
    let base_command = permuted_commands[0];

    let commands = parsedCommands.find((pc) => pc.full_name == base_command);

    if (!commands) {
        throw new Error('Command not found in parsed commands');
    }

    let subcommand = "";

    if (permuted_commands.length > 1) {
        subcommand = permuted_commands.slice(1).join(' ');
    }

    let defaultExtendedData: CommandExtendedData = {
        default_perms: {
            checks: [
                {
                    kittycat_perms: [`${base_command}.*`],
                    native_perms: ["8"],
                    inner_and: false,
                    outer_and: false,
                }
            ],
            checks_needed: 1,
        },
        is_default_enabled: true,
        web_hidden: false,
        virtual_command: false
    }

    return commands.extended_data_map[subcommand] || commands.extended_data_map[''] || defaultExtendedData;
}