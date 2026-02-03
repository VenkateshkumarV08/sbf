# Login Page Setup - AWS Cognito Authentication

## Overview
A modern SvelteKit login page with AWS Cognito authentication, built using Shadcn Svelte components.

## Features
- ✅ AWS Cognito authentication
- ✅ Beautiful UI with Shadcn Svelte components
- ✅ Support for new password challenge
- ✅ Environment variable configuration
- ✅ Auth state management
- ✅ Protected routes
- ✅ Automatic session handling

## Setup

### 1. Environment Variables
Update the `.env` file with your AWS Cognito credentials:

```env
PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
PUBLIC_COGNITO_CLIENT_ID=your-client-id
PUBLIC_COGNITO_REGION=ap-southeast-2
```

The `.env.example` file is provided as a template.

### 2. Dependencies Installed
- `amazon-cognito-identity-js` - AWS Cognito SDK
- Shadcn Svelte components: Button, Input, Label, Card

## Project Structure

```
src/
├── lib/
│   ├── auth/
│   │   └── cognito.ts          # Cognito authentication utilities
│   ├── stores/
│   │   └── auth.ts             # Auth state store
│   └── components/ui/          # Shadcn components
├── routes/
│   ├── login/
│   │   └── +page.svelte        # Login page
│   ├── +layout.server.ts       # Protected route logic
│   └── +layout.svelte
├── hooks.client.ts             # Client-side auth initialization
└── hooks.server.ts             # Server-side session handling
```

## Key Files

### `/src/routes/login/+page.svelte`
The main login page component with:
- Email/password authentication form
- New password challenge support
- Error and success message handling
- Loading states
- Keyboard support (Enter to submit)

### `/src/lib/auth/cognito.ts`
Authentication utilities:
- `authenticateUser()` - Login with email/password
- `completeNewPasswordChallenge()` - Handle new password requirement
- `getCurrentUser()` - Get current Cognito user
- `getCurrentSession()` - Get current session
- `signOut()` - Sign out user

### `/src/lib/stores/auth.ts`
Svelte store for managing authentication state:
- `isAuthenticated` - Boolean flag
- `session` - CognitoUserSession object
- `loading` - Loading state

### `/src/routes/+layout.server.ts`
Protected routes logic:
- Redirects unauthenticated users to `/login`
- Redirects authenticated users from `/login` to home

### `/src/hooks.server.ts` & `/src/hooks.client.ts`
- Initialize and maintain auth session
- Check session on every request

## Usage

### Starting the Development Server
```bash
npm run dev
```

The login page will be available at: `http://localhost:5173/login`

### Authentication Flow

1. **Standard Login:**
   - User enters email and password
   - On success → Redirect to home page
   - On failure → Display error message

2. **New Password Required:**
   - User enters email and temporary password
   - System detects new password requirement
   - Shows new password form
   - User sets new password
   - On success → Redirect to home page

### Using Auth Store in Components

```svelte
<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { signOut } from '$lib/auth/cognito';

  const { isAuthenticated, session } = $derived($authStore);
</script>

{#if isAuthenticated}
  <p>Welcome! You are logged in.</p>
  <button onclick={() => signOut()}>Sign Out</button>
{/if}
```

### Protected Routes

All routes except `/login` are automatically protected. Add exclusions in `/src/routes/+layout.server.ts` if needed.

## Styling

The login page uses:
- **Tailwind CSS** for styling
- **Shadcn Svelte** components for UI
- **Custom gradient** matching the original design (`#00AED5` to `#0088A8`)
- **SBF Logo** from the original login page

## Security Notes

- ⚠️ Never commit `.env` file to version control
- ⚠️ Keep AWS Cognito credentials secure
- ⚠️ Use environment variables for sensitive data
- ✅ `.env.example` provided for reference
- ✅ Session tokens are handled securely by AWS SDK

## Differences from Old Login

| Feature | Old (HTML) | New (SvelteKit) |
|---------|-----------|-----------------|
| Framework | Vanilla HTML/JS | SvelteKit + TypeScript |
| UI Components | Custom CSS | Shadcn Svelte |
| State Management | DOM manipulation | Svelte stores |
| Routing | Manual redirect | SvelteKit navigation |
| Environment | Hardcoded config | .env variables |
| Type Safety | None | Full TypeScript |

## Next Steps

- [ ] Add "Forgot Password" functionality
- [ ] Add "Remember Me" feature
- [ ] Implement refresh token handling
- [ ] Add multi-factor authentication (MFA)
- [ ] Add loading skeleton for better UX
- [ ] Add form validation
- [ ] Add tests

## Troubleshooting

### Environment variables not loading
- Restart dev server after changing `.env`
- Ensure variables start with `PUBLIC_` prefix
- Check `src/app.d.ts` for type definitions

### Session not persisting
- Check browser console for errors
- Verify Cognito configuration
- Check `hooks.client.ts` and `hooks.server.ts`

### TypeScript errors
- Run `npm run check` to validate
- Restart TypeScript server in VS Code

## Resources

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Shadcn Svelte](https://www.shadcn-svelte.com/)
