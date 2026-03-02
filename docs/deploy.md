# Deploy To Cloudflare Pages

## Build Target
- Framework: Vite SPA (static output)
- Build command: `pnpm build:web`
- Output directory: `dist`
- SPA fallback: `_redirects` file contains `/* /index.html 200`

## 1) Connect Repository
1. Open Cloudflare Dashboard -> Workers & Pages -> Create application -> Pages -> Connect to Git.
2. Select this repository and choose the production branch.
3. Set project name.

## 2) Configure Build
1. Build command: `pnpm build:web`
2. Build output directory: `dist`
3. Root directory: repository root.
4. Environment:
   - `NODE_VERSION`: use current LTS or newer (Node 22+ tested locally).

## 3) Deploy
1. Trigger first deployment from Cloudflare Pages.
2. Verify the deployment URL loads and deep-links (for example `/test`) render the SPA.

## 4) Attach Custom Domain
1. In Pages project -> Custom domains -> Set up a custom domain.
2. Enter the domain/subdomain and follow Cloudflare DNS prompts.
3. Wait for SSL certificate provisioning (HTTPS becomes active automatically).
4. Confirm both apex/subdomain routes resolve to the Pages project.

## 5) SPA Fallback
- The build includes `dist/_redirects` with:
  - `/* /index.html 200`
- This ensures unknown URLs route to the SPA entry point.

## 6) Post-Deploy Verification
1. Open the production URL and confirm no console errors.
2. Confirm favicon, page title, and meta description are present.
3. Confirm deep links load correctly under HTTPS.
