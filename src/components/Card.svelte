<script>
    export let name;
    export let title;
    export let description;
    export let image;
    export let button;
</script>

<div id={name} class="p-6 max-w-sm bg-white rounded-md border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
    <h5 class="mb-2 text-2xl font-bold tracking-light text-gray-900 dark:text-white">{title}</h5>
    <img class="align-right" src={image} height="100px" width="100px" alt="Image" />
    <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">{description}</p>

    {#if button}
        <button on:click={button.click} class="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-emerald-700 rounded-md focus:ring-4 focus:outline-none focus:ring-emerald-300 dark:bg-emerald-700 dark:focus:ring-emerald-800">{button.name}</button>
    {/if}
</div>

<div class="p-3"></div>