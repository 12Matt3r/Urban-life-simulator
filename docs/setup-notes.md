# Urban Life Simulator - Setup Notes

## Supabase Bootstrap

Add this initialization code early in life_script.js:

```javascript
// bootstrap somewhere early (e.g., in life_script init)
import { initSupabase } from './systems/db.js';
initSupabase({ url: 'https://YOUR-PROJECT.supabase.co', anonKey: 'YOUR-ANON-KEY' });
```

## Deployment Commands

```bash
# Deploy edge function
supabase functions deploy narrate --no-verify-jwt
# or keep JWT and call with your supabase client auth; adjust client headers if so
```
