# Builder Farcaster Tools

[![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/nouns-build/builder-farcaster?include_prereleases)](https://github.com/nouns-build/builder-farcaster/releases)
[![GitHub](https://img.shields.io/github/license/nouns-build/builder-farcaster)](https://github.com/nouns-build/builder-farcaster/blob/master/LICENSE)
[![X (formerly Twitter) Follow](https://img.shields.io/badge/follow-%40nekofar-ffffff?logo=x&style=flat)](https://x.com/nekofar)
[![Farcaster (Warpcast) Follow](https://img.shields.io/badge/follow-%40nekofar-855DCD.svg?logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMzIzIiBoZWlnaHQ9IjI5NyIgdmlld0JveD0iMCAwIDMyMyAyOTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01NS41ODY3IDAuNzMzMzM3SDI2My40MTNWMjk2LjI2N0gyMzIuOTA3VjE2MC44OTNIMjMyLjYwN0MyMjkuMjM2IDEyMy40NzkgMTk3Ljc5MiA5NC4xNiAxNTkuNSA5NC4xNkMxMjEuMjA4IDk0LjE2IDg5Ljc2NDIgMTIzLjQ3OSA4Ni4zOTI2IDE2MC44OTNIODYuMDkzM1YyOTYuMjY3SDU1LjU4NjdWMC43MzMzMzdaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMC4yOTMzMzUgNDIuNjhMMTIuNjg2NyA4NC42MjY3SDIzLjE3MzNWMjU0LjMyQzE3LjkwODIgMjU0LjMyIDEzLjY0IDI1OC41ODggMTMuNjQgMjYzLjg1M1YyNzUuMjkzSDExLjczMzNDNi40NjgyMiAyNzUuMjkzIDIuMiAyNzkuNTYyIDIuMiAyODQuODI3VjI5Ni4yNjdIMTA4Ljk3M1YyODQuODI3QzEwOC45NzMgMjc5LjU2MiAxMDQuNzA1IDI3NS4yOTMgOTkuNDQgMjc1LjI5M0g5Ny41MzMzVjI2My44NTNDOTcuNTMzMyAyNTguNTg4IDkzLjI2NTEgMjU0LjMyIDg4IDI1NC4zMkg3Ni41NlY0Mi42OEgwLjI5MzMzNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMzQuODEzIDI1NC4zMkMyMjkuNTQ4IDI1NC4zMiAyMjUuMjggMjU4LjU4OCAyMjUuMjggMjYzLjg1M1YyNzUuMjkzSDIyMy4zNzNDMjE4LjEwOCAyNzUuMjkzIDIxMy44NCAyNzkuNTYyIDIxMy44NCAyODQuODI3VjI5Ni4yNjdIMzIwLjYxM1YyODQuODI3QzMyMC42MTMgMjc5LjU2MiAzMTYuMzQ1IDI3NS4yOTMgMzExLjA4IDI3NS4yOTNIMzA5LjE3M1YyNjMuODUzQzMwOS4xNzMgMjU4LjU4OCAzMDQuOTA1IDI1NC4zMiAyOTkuNjQgMjU0LjMyVjg0LjYyNjdIMzEwLjEyN0wzMjIuNTIgNDIuNjhIMjQ2LjI1M1YyNTQuMzJIMjM0LjgxM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=&style=flat)](https://warpcast.com/nekofar)
[![Donate](https://img.shields.io/badge/donate-nekofar.crypto-a2b9bc?logo=ko-fi&logoColor=white)](https://ud.me/nekofar.crypto)

Tools and automation solutions for Builder DAO on Farcaster, enhancing community efficiency and engagement.

> [!WARNING]
> Please note that the project is currently in an experimental phase and it is subject to significant changes as it
> progresses.

## Setup Instruction

### Step 1: Create a New Repository on GitHub

1. Go to [GitHub](https://github.com) and log in to your account.
2. Click the **+** icon in the top right corner and select **New repository**.
3. Enter a **Repository name** of your choice—try to make it descriptive and easy to remember.
4. Leave the repository **empty** for now:
   - **Uncheck** the box for "Add a README file."
   - **Do not** add any `.gitignore` or license files.
5. Choose whether you want the repository to be **public** or **private** depending on your use case.
6. Click **Create repository** to finish up.

### Step 2: Clone the Repository

In this step, we’re going to clone an existing repository to your local machine.

1. First, you need to have the GitHub CLI (`gh`) installed. If you don’t already have it, you can install it from the [GitHub CLI documentation](https://cli.github.com/). It's available for all major operating systems, and trust me, it makes interacting with GitHub a lot easier.

2. Once you have `gh` installed, use the following command to clone the repository:

   ```bash
   gh repo clone nouns-build/builder-farcaster
   ```

   This command will clone the `nouns-build/builder-farcaster` repository into your local development environment. Ensure you run it from the desired directory.

### Step 3: Change Repository Origin and Push to GitHub

Now that you have the repository cloned locally, let's change the remote repository's origin to your new GitHub repository and push the changes.

1. Navigate into the cloned repository:

   ```bash
   cd builder-farcaster
   ```

2. Change the Git remote origin to point to your own repository. Replace `<your-github-username>` and `<your-repo-name>` with your GitHub username and the repository name you created in Step 1:

   ```bash
   git remote set-url origin https://github.com/<your-github-username>/<your-repo-name>.git
   ```

3. Verify that the new origin URL is set correctly:

   ```bash
   git remote -v
   ```

   You should see the updated URL pointing to your GitHub repository.

4. Push the changes to your GitHub repository:

   ```bash
   git push -u origin master
   ```

   This command will push the local content to your newly created GitHub repository.

### Step 4: Set Environment Variables and Secrets

You can configure the environment variables and secrets either through the GitHub CLI as described below or directly from your GitHub repository settings page, under the 'Settings' tab, by navigating to 'Secrets and variables'.

Next, we will configure the environment variables and secrets for the repository using the GitHub CLI.

1. Set the environment variables using `gh`:

   ```bash
   gh variable set NODE_ENV --body "production"
   gh variable set DATABASE_URL --body "file:./prod.db"
   gh variable set BUILDER_SUBGRAPH_ETHEREUM_URL --body "https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-ethereum-mainnet/stable/gn"
   gh variable set BUILDER_SUBGRAPH_BASE_URL --body "https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-base-mainnet/stable/gn"
   gh variable set BUILDER_SUBGRAPH_OPTIMISM_URL --body "https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-optimism-mainnet/stable/gn"
   gh variable set BUILDER_SUBGRAPH_ZORA_URL --body "https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-zora-mainnet/stable/gn"
   gh variable set WARPCAST_BASE_URL --body "https://api.warpcast.com"
   ```

2. Set the secrets using `gh` for sensitive information (Note: Secrets for Builder projects are available in the shared vault. If you are using this setup for personal purposes, you can obtain your API KEY by following the instructions here: [Public Programmable DCs v1](https://www.notion.so/warpcast/Public-Programmable-DCs-v1-50d9d99e34ac4d10add55bd26a91804f)):

   ```bash
   gh secret set SSH_PRIVATE_KEY
   gh secret set WARPCAST_API_KEY
   gh secret set WARPCAST_ACCESS_TOKEN
   ```

   These commands will securely add environment variables and secrets to your GitHub repository.
