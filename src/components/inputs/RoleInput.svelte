<script lang="ts">
	import { SerenityRole } from '$lib/generated/ext';
	import RawSelect from './select/RawSelect.svelte';
	import Debug from '../common/Debug.svelte';

	export let roles: SerenityRole[];
	export let botRoles: string[];
	export let value: string;
	export let required: boolean = false;
	export let disabled: boolean;

	let selectedRole: SerenityRole;

	/**
	 * Compare roles based on position (if position is the same, sort by id)
	 * @param a
	 * @param b
	 *
	 * @returns -1 if a is less than b, 1 if a is greater than b, 0 if equal
	 */
	const compareRoles = (a: SerenityRole, b: SerenityRole): number => {
		if (a.position < b.position) return -1;
		else if (a.position > b.position) return 1;
		else {
			if (a.id < b.id) return -1;
			else if (a.id > b.id) return 1;
			else return 0;
		}
	};

	/**
	 * Sort roles based on position (if position is the same, sort by id)
	 */
	const sortRoles = (roles: SerenityRole[]): SerenityRole[] => {
		let copiedRoles = [...roles];

		return copiedRoles.sort(compareRoles);
	};

	const getChoices = (botRoles: string[], roles: SerenityRole[]) => {
		let maxBotRole: string | null = null;

		for (let role of botRoles) {
			if (
				!maxBotRole ||
				(roles?.find((r) => r?.id === role)?.position || -1) >
					(roles?.find((r) => r?.id === maxBotRole)?.position || 0)
			) {
				maxBotRole = role;
			}
		}

		let maxBotRoleObj = roles.find((role) => role?.id === maxBotRole);

		return sortRoles(roles).map((role) => {
			if (!role)
				return {
					id: '',
					value: '',
					label: 'Unknown Role',
					disabled: true
				};

			let disabled = false;
			if (maxBotRoleObj) {
				disabled = compareRoles(role, maxBotRoleObj) < 0;
			}

			return {
				id: role.id,
				value: role.id,
				label: `${role.name}`,
				disabled: disabled // TODO: Implement role constraints
			};
		});
	};

	// Set selected channel if value is set
	$: if (value) {
		let r = roles.find((role) => role?.id === value);

		if (r) {
			selectedRole = r;
		}
	}
</script>

<RawSelect id="role" choices={getChoices(botRoles, roles)} {required} {disabled} bind:value />

{#if selectedRole}
	<Debug
		data={{
			Role: selectedRole
		}}
	/>
{/if}
