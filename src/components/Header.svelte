<script lang="ts">
	import Update from './Update.svelte';
	import { page } from '$app/stores';
	import { getAuthCreds } from '../lib/auth/getAuthCreds';
	import { checkAuthCreds } from '../lib/auth/checkAuthCreds';
	import { logoutUser } from '../lib/auth/logoutUser';
	import { getUser } from '../lib/auth/getUser';
	import { User } from '../lib/generated/types';
	import Icon from '@iconify/svelte';
	import NavButton from './inputs/button/NavButton.svelte';
	import { loginUser } from '$lib/auth/loginUser';
	import { LSAuthData } from '$lib/auth/core';
	import { browser } from '$app/environment';
	import Themer from './Themer.svelte';
	import { onDestroy, onMount } from 'svelte';

	let navigation = [
		{ name: 'Home', href: '/' },
		{ name: 'Invite', href: '/invite' },
		{ name: 'About', href: '/about' },
		{ name: 'Commands', href: '/commands' },
		{ name: 'Status', href: '/status' }
	];

	let open = '';

	interface OpenElements {
		[key: string]: {
			open: boolean;
			bind: HTMLElement | null;
		};
	}

	let openElements: OpenElements = {
		mobileMenu: {
			open: false,
			bind: null
		},
		profileMenu: {
			open: false,
			bind: null
		},
		themeMenu: {
			open: false,
			bind: null
		}
	};

	// Handles clicks outside an open element
	const handleOutsideOpenElementClicks = (e: MouseEvent) => {
		for (let key in openElements) {
			if (openElements[key].open) {
				if (!openElements[key].bind?.contains(e.target as Node)) {
					openElements[key].open = false;
				}
			}
		}
	};

	onMount(() => {
		if (browser) {
			document.addEventListener('mousedown', handleOutsideOpenElementClicks);
		}
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('mousedown', handleOutsideOpenElementClicks);
		}
	});

	type LoginData = null | {
		profileNavigation: {
			name: string;
			href?: string;
			onclick?: () => void;
		}[];
		user: User;
	};

	const checkUserAuth = async (authCreds: LSAuthData) => {
		// Check auth
		if (!authCreds) {
			throw new Error('No auth credentials found');
		}

		try {
			let check = await checkAuthCreds(authCreds);

			if (!check) {
				logoutUser();
				return;
			}
		} catch {
			return;
		}
	};

	const getLoginData = async () => {
		let authCreds = getAuthCreds();

		if (!authCreds) {
			return null;
		}

		let cachedAuthUser = localStorage.getItem('authUser');

		if (!cachedAuthUser) {
			let userRes = await getUser(authCreds.user_id);
			cachedAuthUser = JSON.stringify(userRes);
			localStorage.setItem('authUser', cachedAuthUser);
		}

		let user: User = JSON.parse(cachedAuthUser);

		if (!user) {
			logoutUser();
			return;
		}

		setInterval(checkUserAuth, 1000 * 60 * 5);

		let data: LoginData = {
			profileNavigation: [
				{
					name: 'Dashboard',
					href: '/dashboard'
				},
				{
					name: 'Developers',
					href: '/dashboard/developers'
				},
				{
					name: 'Logout',
					onclick: () => {
						logoutUser();
						window.location.reload();
					}
				}
			],
			user
		};

		return data;
	};

	$: {
		navigation.map((p) => {
			if (p.href === $page.url.pathname) open = p.name;
		});
	}
</script>

<Update
	id="experimental-site-notice"
	short="This site is experimental."
	long="This website is experimental, and may have issues."
/>

<header class="top-0 w-full">
	<div class="max-w-7xl px-3 mx-auto py-3 flex items-center justify-between">
		<a href="/">
			<div class="flex items-center space-x-1">
				<img class="h-8 w-auto" src="/logo.webp" alt="Antiraid" />
				<p class="text-md text-white font-monster font-semibold">
			           AntiRaid
				</p>
			</div>
		</a>
		<div class="flex items-center space-x-2 relative">
			<div class="flex space-x-4">
				{#each navigation as item}
					<NavButton
						title={item.name}
						href={item.href}
						current={item.name === open}
						onClick={() => {
							openElements.mobileMenu.open = false;
						}}
						extClass="hidden md:block"
					/>
				{/each}
			</div>
		</div>
		<div class="flex items-center space-x-2">
			<button
				type="button"
				class="block md:hidden rounded-md p-2 font-medium text-left text-gray-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-1 focus:ring-inset focus:ring-white"
				on:click={() => (openElements.mobileMenu.open = !openElements.mobileMenu.open)}
				aria-controls="mobile-menu"
				aria-expanded="false"
			>
				<span class="sr-only">Open main menu</span>
				{#if openElements.mobileMenu.open}
					<Icon icon="fa-solid:times" width="12px" />
				{:else}
					<Icon icon="fa-solid:bars" width="16px" />
				{/if}
			</button>

			<span class="relative">
				<button
					name="themer-pane"
					aria-label="View Themes"
					on:click={() => (openElements.themeMenu.open = !openElements.themeMenu.open)}
					class={openElements.themeMenu.open
						? 'px-3 py-2 text-center text-white rounded-md bg-primary-500 bg-opacity-20'
						: 'px-3 py-2 text-center text-white bg-transparent rounded-md hover:bg-primary-500 hover:bg-opacity-20'}
				>
					<Icon icon="mdi:palette" class="text-3xl text-white-900" />
				</button>
				<div bind:this={openElements.themeMenu.bind} class="themer-div text-left">
					<Themer bind:isOpen={openElements.themeMenu.open} />
				</div>
			</span>

			{#await getLoginData()}
				<Icon icon="fa-solid:yin-yang" width="32px" class="animate-spin text-white" />
				<span class="animate-pulse text-white">...</span>
			{:then data}
				{#if data && data?.user}
					<div class="w-full">
						<button
							type="button"
							class="flex rounded-full hover:bg-gray-200 text-white hover:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
							id="user-menu-button"
							aria-expanded="false"
							aria-haspopup="true"
							on:click={() => (openElements.profileMenu.open = !openElements.profileMenu.open)}
						>
							<span class="sr-only">Open user menu</span>
							<img class="h-8 w-8 rounded-full" src={data?.user?.user?.avatar} alt="" />
						</button>

						{#if openElements.profileMenu.open}
							<div
								bind:this={openElements.profileMenu.bind}
								role="menu"
								aria-orientation="vertical"
								aria-labelledby="user-menu-button"
								id="profile-menu"
								class="text-white font-semibold"
							>
								<div
									class="transition absolute z-50 w-96 max-w-sm px-4 mt-3 transform -right-0 opacity-100 translate-y-0"
								>
									<div
										class="dropdown-container overflow-hidden rounded-lg shadow-lg ring-1 ring-black bg-black ring-opacity-5"
									>
										<div class="relative w-full">
											{#each data?.profileNavigation || [] as item}
												{#if item.href}
													<a
														on:click={() => {
															openElements.profileMenu.open = false;
														}}
														href={item.href}
														class="block hover:bg-slate-800 p-7"
													>
														{item.name}
													</a>
												{:else}
													<button
														on:click={() => {
															item.onclick?.();
														}}
														class="text-left block w-full hover:bg-slate-800 p-7 hover:cursor-pointer"
													>
														{item.name}
													</button>
												{/if}
											{/each}
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<button
						type="button"
						on:click={loginUser}
						class="px-4 py-2 text-sm font-medium text-left text-gray-50 rounded-lg cursor-pointer bg-indigo-600 hover:bg-indigo-800 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-white"
					>
						Login
					</button>
				{/if}
			{:catch err}
				<button
					type="button"
					on:click={() => {
						window.location.reload();
					}}
					class="text-red-500"
				>
					Reload? {err}
				</button>
			{/await}
		</div>
	</div>

	{#if openElements.mobileMenu.open}
		<div id="mobile-menu" class="md:hidden" bind:this={openElements.mobileMenu.bind}>
			<div class="space-y-1 px-2 pt-2 pb-3">
				{#each navigation as item}
					<NavButton
						title={item.name}
						href={item.href}
						current={item.name === open}
						onClick={() => {
							openElements.mobileMenu.open = false;
						}}
						extClass="block"
					/>
				{/each}
			</div>
		</div>
	{/if}
</header>
