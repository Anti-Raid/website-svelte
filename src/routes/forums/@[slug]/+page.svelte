<script lang="ts">
	import type { PageData } from './$types';
	import Meta from '../../../components/Meta.svelte';
	import Profile from '../../../components/forums/Profile.svelte';
	import Message from '../../../components/Message.svelte';

	export let data: PageData;
</script>

{#if !data.profile || (data.profile && 'error' in data.profile)}
	<Meta
		title="Unknown Profile - AntiRaid Forums"
		description="Sorry, that profile cannot be found."
	/>

	<Message big={true} type={'error'}>{data.profile.message || "Sorry, that profile cannot be found."}</Message>
{:else}
	<Meta
		title="@{data.profile.usertag}'s Profile - AntiRaid Forums"
		description={data.profile.bio}
		image={data.profile.avatar}
	/>

	<Profile
		Profile={data.profile}
		AuthedUser={data.user}
		UserPosts={data.profilePosts}
		Token={data.token}
	/>
{/if}
