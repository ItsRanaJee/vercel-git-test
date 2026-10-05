# vercel-git-test

This project is a practical full-stack Node.js single-page application built to connect to a Supabase database, store data, and deploy automatically from GitHub to Vercel.

## 1. Project setup in VS Code

1. Open VS Code.
2. Create a new folder for the project.
3. Open the folder in VS Code.
4. Open the terminal in VS Code and initialize the Node.js project:

```bash
npm init -y
```

Install the required dependencies:

```bash
npm install express @supabase/supabase-js dotenv
```

Create a file named `server.js` with the Express app and API routes.

Create a `public` folder with:
- `index.html`
- `styles.css`
- `app.js`

The structure will look like this:

```text
project/
+-- public/
¦   +-- index.html
¦   +-- styles.css
¦   +-- app.js
+-- .env.example
+-- .gitignore
+-- package.json
+-- server.js
+-- vercel.json
+-- README.md
```

## 2. Configure the app to connect to Supabase

Create a `.env` file from the `.env.example` template:

```bash
cp .env.example .env
```

Set the values:

```env
PORT=3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Install the Supabase SDK

The project includes:

```bash
npm install @supabase/supabase-js
```

In `server.js`, initialize the client:

```js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
```

Then use it to read and write records:

```js
const { data, error } = await supabase.from('items').select('*');
```

```js
const { data, error } = await supabase
  .from('items')
  .insert([{ title, description }]);
```

## 3. Create the database table in Supabase

1. Open your Supabase project.
2. Go to the SQL Editor.
3. Run the following SQL:

```sql
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  created_at timestamptz default now()
);

alter table public.items enable row level security;

create policy "Allow all anon access"
on public.items
for all
using (true)
with check (true);
```

> This setup is intentionally simple for a demo app. In production, tighten Row Level Security based on your authentication model.

## 4. Build the app logic

The app needs two backend operations:

### Read all rows

```js
app.get('/api/items', async (req, res) => {
  const { data, error } = await supabase.from('items').select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});
```

### Insert a row

```js
app.post('/api/items', async (req, res) => {
  const { title, description } = req.body;

  const { data, error } = await supabase
    .from('items')
    .insert([{ title, description }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});
```

Then in the browser, fetch those API routes from the single-page app.

## 5. Run the application locally

Start the app:

```bash
npm install
npm run dev
```

Open the browser at:

```text
http://localhost:3000
```

The page will load a form and list saved entries. When Supabase is connected, the form can save data and the list will refresh automatically.

## 6. Set up Git version control

Initialize Git in the project:

```bash
git init
```

Create a `.gitignore` file:

```gitignore
node_modules/
.env
.env.local
.vercel
```

Check the current repository status:

```bash
git status
```

Stage the files:

```bash
git add .
```

Create the first commit:

```bash
git commit -m "Initial app setup"
```

## 7. Create the GitHub repository and push the code

1. Go to GitHub and click New repository.
2. Name the repo, for example:
   - `vercel-supabase-demo`
3. Choose Public or Private.
4. Do not initialize with a README if you already have files locally.
5. Click Create repository.

From VS Code terminal, connect the repo and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

If GitHub prompts for authentication, use a personal access token or GitHub login flow in the browser.

## 8. Connect GitHub to Vercel for automatic deployment

1. Sign in to Vercel.
2. Click Add New Project.
3. Select the GitHub repository you just pushed.
4. Choose the repository and click Import.
5. Vercel will detect the project settings automatically.

### Vercel build settings

Use these values:

- Framework: Other / Node.js
- Root Directory: `.`
- Build Command: leave blank or use `npm run build` only if you add one
- Output Directory: leave blank
- Install Command: `npm install`

Because this project is a Node.js backend app, the app does not need a framework-specific build step.

### Vercel server configuration

Add a `vercel.json` file like this:

```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server.js" },
    { "src": "/(.*)", "dest": "server.js" }
  ]
}
```

This allows the app to serve both the API and the SPA routes.

## 9. Configure environment variables in Vercel

In Vercel:

1. Open your project.
2. Go to Settings > Environment Variables.
3. Add the same keys as in `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PORT`
4. Set the environment for Production, Preview, and Development as needed.
5. Redeploy the project.

### Important

Do not commit real secrets to Git. Keep them in Vercel and local `.env` files only.

## 10. Secure environment variables across platforms

Your app should have separate environments:

### Local development

- `.env` file in the project root
- Do not commit it to Git

### GitHub

- Use GitHub repository secrets only for CI/CD workflows if you add workflows
- The code itself should not contain raw credentials

### Vercel

- Add variables in Vercel Project Settings > Environment Variables
- These values are used during deployment and runtime

## 11. Test the complete flow

Use this checklist to validate the whole pipeline:

### Local test

1. Create `.env` with your Supabase keys.
2. Run:

```bash
npm install
npm run dev
```

3. Open `http://localhost:3000`.
4. Add a note.
5. Confirm it appears in the list.
6. Confirm the record exists in Supabase.

### GitHub push test

1. Save changes in VS Code.
2. Run:

```bash
git add .
git commit -m "Add app and deployment config"
git push origin main
```

3. Check the repository on GitHub.

### Vercel deployment check

1. Open your Vercel project.
2. Confirm the deployment starts automatically.
3. Wait for the build to finish.
4. Open the production URL.
5. Verify the app loads and connects to Supabase.

## 12. Production tips

- Use environment variables for all credentials.
- Configure Supabase Row Level Security carefully.
- Add a real database schema and validation in the backend.
- Use GitHub branches for development and production promotion.
- Set Vercel to deploy from the main branch.

## 13. Summary

This setup gives you a complete pipeline:

- VS Code local development
- Node.js application with Express API
- Supabase persistence
- GitHub repository version control
- Vercel automatic deployment
- Secure environment variable management

This is the standard flow for a modern full-stack app that needs quick iteration and reliable deployment.
