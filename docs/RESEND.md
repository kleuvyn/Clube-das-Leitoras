Resend setup and domain validation

1) Validate domain/email in Resend
- Go to https://resend.com -> Settings -> Sending Domains
- Add clubedasleitoras.com.br and follow DNS TXT instructions
- Wait for DNS propagation and for Resend to show "verified"

2) Environment variables
- Set in production hosting (Vercel/Render/etc):
  - `RESEND_API_KEY` = (your Resend API key)
  - `RESEND_FROM` = "Clube das Leitoras <no-reply@clubedasleitoras.com.br>"
  - `NEXT_PUBLIC_SITE_URL` = https://clubedasleitoras.com.br

3) Notes
- While domain is not verified you can use `onboarding@resend.dev` but it only sends to verified emails on your Resend account.
- After updating env, redeploy or restart the app.

4) Quick restart (local dev):

```bash
# stop dev server and start again
pnpm dev
# or if using npm
npm run dev
```
