<script lang="ts">
	import { PageData } from './$types';

	export let data: PageData;
	let i = JSON.stringify(data, null, 4);
</script>

<textarea
	id="editor"
	rows="8"
	class="block w-full px-2 text-sm rounded-md text-white bg-slate-600 font-cabin font-semibold border-0 focus:ring-0"
	placeholder="Sorry, no data was recieved from the server."
	contenteditable="false"
	bind:textContent={i}
	required
/>
