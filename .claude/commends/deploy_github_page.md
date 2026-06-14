Deploy this project to GitHub Pages and return the live URL.

## Steps

1. Check prerequisites in order — stop at first failure:

   **gh CLI installed?**
   ```bash
   gh --version
   ```
   If not found: tell user to install from https://cli.github.com and stop.

   **Logged in to GitHub?**
   ```bash
   gh auth status
   ```
   If not authenticated: run the web login flow in Chrome:
   ```bash
   BROWSER="open -a 'Google Chrome'" gh auth login --hostname github.com --git-protocol https --web
   ```

   **Git initialized?**
   ```bash
   git status
   ```
   If not a git repo: run `git init && git add . && git commit -m "Initial commit"`.

   **Remote origin exists?**
   ```bash
   git remote get-url origin 2>/dev/null || echo "NO_REMOTE"
   ```
   If no remote: ask user for repo name (default: current folder name), then:
   ```bash
   gh repo create <REPO_NAME> --public --source=. --remote=origin --push
   ```

2. Get GitHub info:
   ```bash
   USERNAME=$(gh api user --jq .login)
   REPO_NAME=$(basename $(git remote get-url origin) .git)
   ```

3. Build the frontend:
   ```bash
   npm run build
   ```
   If build fails, show error and stop. Output directory is `build/`.

4. Set up gh-pages:
   - Install if needed: `npm list gh-pages --depth=0 2>/dev/null | grep gh-pages || npm install --save-dev gh-pages`
   - Add to `package.json` (use Edit tool, do not rewrite the file):
     - `"homepage": "https://<USERNAME>.github.io/<REPO_NAME>"`
     - `"deploy": "gh-pages -d build"` under scripts
   - Ensure `vite.config.ts` has `base: '/<REPO_NAME>/'` so asset paths are correct on GitHub Pages

5. Deploy:
   ```bash
   npm run deploy
   ```

6. Display the result:
   ```
   Deployment complete!
   Live URL: https://<USERNAME>.github.io/<REPO_NAME>

   Note: GitHub Pages may take 1–2 minutes to go live on first deployment.
   On subsequent deploys: npm run build && npm run deploy
   ```

## Notes
- Deploys **frontend only**. Backend requires separate deployment.
- `gh-pages` pushes `build/` to the `gh-pages` branch; GitHub Pages serves that branch automatically.
- `base` in `vite.config.ts` must match the repo name, otherwise the page will be blank.
