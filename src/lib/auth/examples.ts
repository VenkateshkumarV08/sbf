// Examples of using the authentication system

import { authStore } from '$lib/stores/auth.svelte';
import { signOutAndRedirect, getUserEmail, getAccessToken } from '$lib/auth/utils';

// ============================================
// Example 1: Check if user is authenticated
// ============================================

// In a Svelte component:
// <script lang="ts">
//   import { authStore } from '$lib/stores/auth';
// </script>
// 
// {#if authStore.isAuthenticated}
//   <p>Welcome back!</p>
// {:else}
//   <p>Please log in</p>
// {/if}

// ============================================
// Example 2: Get user email
// ============================================

// <script lang="ts">
//   import { getUserEmail } from '$lib/auth/utils';
//   import { authStore } from '$lib/stores/auth';
//   
//   const email = $derived(authStore.session ? getUserEmail() : null);
// </script>
// 
// {#if email}
//   <p>Logged in as: {email}</p>
// {/if}

// ============================================
// Example 3: Sign out button
// ============================================

// <script lang="ts">
//   import { Button } from '$lib/components/ui/button';
//   import { signOutAndRedirect } from '$lib/auth/utils';
// </script>
// 
// <Button onclick={signOutAndRedirect}>
//   Sign Out
// </Button>

// ============================================
// Example 4: Protected page (server-side)
// ============================================

// src/routes/protected/+page.server.ts
// import { redirect } from '@sveltejs/kit';
// import type { PageServerLoad } from './$types';
// 
// export const load: PageServerLoad = async ({ locals }) => {
//   if (!locals.session) {
//     throw redirect(302, '/login');
//   }
//   
//   return {
//     user: {
//       email: locals.session.getIdToken().payload.email
//     }
//   };
// };

// ============================================
// Example 5: Make authenticated API call
// ============================================

// <script lang="ts">
//   import { getAccessToken } from '$lib/auth/utils';
//   
//   async function fetchUserData() {
//     const token = getAccessToken();
//     
//     if (!token) {
//       console.error('No access token available');
//       return;
//     }
//     
//     const response = await fetch('https://api.example.com/user', {
//       headers: {
//         'Authorization': \`Bearer \${token}\`,
//         'Content-Type': 'application/json'
//       }
//     });
//     
//     return await response.json();
//   }
// </script>

// ============================================
// Example 6: Reactive derived values
// ============================================

// <script lang="ts">
//   import { authStore } from '$lib/stores/auth';
//   
//   const username = $derived(
//     authStore.session?.getIdToken().payload.email?.split('@')[0] || 'Guest'
//   );
// </script>
// 
// <p>Welcome, {username}!</p>

// ============================================
// Example 7: Conditional navigation menu
// ============================================

// <script lang="ts">
//   import { authStore } from '$lib/stores/auth';
// </script>
// 
// <nav>
//   <a href="/">Home</a>
//   
//   {#if authStore.isAuthenticated}
//     <a href="/dashboard">Dashboard</a>
//     <a href="/profile">Profile</a>
//     <a href="/settings">Settings</a>
//   {:else}
//     <a href="/login">Login</a>
//   {/if}
// </nav>

// ============================================
// Example 8: Loading state during auth check
// ============================================

// <script lang="ts">
//   import { authStore } from '$lib/stores/auth';
// </script>
// 
// {#if authStore.loading}
//   <p>Checking authentication...</p>
// {:else if authStore.isAuthenticated}
//   <p>Welcome!</p>
// {:else}
//   <p>Please log in</p>
// {/if}
