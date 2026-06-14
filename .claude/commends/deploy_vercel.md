Deploy this project to Vercel and return the deployment URL.

## Steps

1. Check that the Vercel CLI is installed:
   ```bash
   vercel --version
   ```
   If not found, tell the user to install it with `npm i -g vercel` and stop.

2. Build the frontend:
   ```bash
   npm run build
   ```
   If the build fails, show the error and stop.

3. Deploy to Vercel production, specifying the correct settings for this Vite project:
   ```bash
   vercel --prod --yes \
     --build-env NODE_ENV=production \
     --local-config vercel.json 2>&1 || \
   vercel --prod --yes 2>&1
   ```
   Pass `--yes` to skip interactive prompts. The output directory is `build/` and the framework is Vite.

4. If a `vercel.json` does not exist at the project root, create one before deploying:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "build",
     "framework": "vite",
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
   Then run `vercel --prod --yes` again.

5. Extract the deployment URL from the CLI output (the line starting with `https://`) and display it clearly to the user.

## Notes
- This deploys the **frontend only**. The Express backend (`server/`) requires a separate deployment (e.g. Railway, Render, or Vercel serverless functions).
- If the user is not logged in to Vercel CLI, prompt them to run `! vercel login` first.
- If the project is not yet linked to a Vercel project, `vercel --prod --yes` will create a new one automatically on first run.
