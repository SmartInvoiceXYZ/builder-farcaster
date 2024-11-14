# Builder Farcaster Tools

[![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/nouns-build/builder-farcaster?include_prereleases)](https://github.com/nouns-build/builder-farcaster/releases)
[![GitHub](https://img.shields.io/github/license/nouns-build/builder-farcaster)](https://github.com/nouns-build/builder-farcaster/blob/master/LICENSE)
[![X (formerly Twitter) Follow](https://img.shields.io/badge/follow-%40nekofar-ffffff?logo=x&style=flat)](https://x.com/nekofar)
[![Farcaster (Warpcast) Follow](https://img.shields.io/badge/follow-%40nekofar-855DCD.svg?logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMzIzIiBoZWlnaHQ9IjI5NyIgdmlld0JveD0iMCAwIDMyMyAyOTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01NS41ODY3IDAuNzMzMzM3SDI2My40MTNWMjk2LjI2N0gyMzIuOTA3VjE2MC44OTNIMjMyLjYwN0MyMjkuMjM2IDEyMy40NzkgMTk3Ljc5MiA5NC4xNiAxNTkuNSA5NC4xNkMxMjEuMjA4IDk0LjE2IDg5Ljc2NDIgMTIzLjQ3OSA4Ni4zOTI2IDE2MC44OTNIODYuMDkzM1YyOTYuMjY3SDU1LjU4NjdWMC43MzMzMzdaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMC4yOTMzMzUgNDIuNjhMMTIuNjg2NyA4NC42MjY3SDIzLjE3MzNWMjU0LjMyQzE3LjkwODIgMjU0LjMyIDEzLjY0IDI1OC41ODggMTMuNjQgMjYzLjg1M1YyNzUuMjkzSDExLjczMzNDNi40NjgyMiAyNzUuMjkzIDIuMiAyNzkuNTYyIDIuMiAyODQuODI3VjI5Ni4yNjdIMTA4Ljk3M1YyODQuODI3QzEwOC45NzMgMjc5LjU2MiAxMDQuNzA1IDI3NS4yOTMgOTkuNDQgMjc1LjI5M0g5Ny41MzMzVjI2My44NTNDOTcuNTMzMyAyNTguNTg4IDkzLjI2NTEgMjU0LjMyIDg4IDI1NC4zMkg3Ni41NlY0Mi42OEgwLjI5MzMzNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMzQuODEzIDI1NC4zMkMyMjkuNTQ4IDI1NC4zMiAyMjUuMjggMjU4LjU4OCAyMjUuMjggMjYzLjg1M1YyNzUuMjkzSDIyMy4zNzNDMjE4LjEwOCAyNzUuMjkzIDIxMy44NCAyNzkuNTYyIDIxMy44NCAyODQuODI3VjI5Ni4yNjdIMzIwLjYxM1YyODQuODI3QzMyMC42MTMgMjc5LjU2MiAzMTYuMzQ1IDI3NS4yOTMgMzExLjA4IDI3NS4yOTNIMzA5LjE3M1YyNjMuODUzQzMwOS4xNzMgMjU4LjU4OCAzMDQuOTA1IDI1NC4zMiAyOTkuNjQgMjU0LjMyVjg0LjYyNjdIMzEwLjEyN0wzMjIuNTIgNDIuNjhIMjQ2LjI1M1YyNTQuMzJIMjM0LjgxM1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=&style=flat)](https://warpcast.com/nekofar)
[![Donate](https://img.shields.io/badge/donate-nekofar.crypto-a2b9bc?logo=ko-fi&logoColor=white)](https://ud.me/nekofar.crypto)

Tools and automation solutions for Builder DAO on Farcaster, enhancing community efficiency and engagement.

> [!WARNING]
> Please note that the project is currently in an experimental phase and it is subject to significant changes as it
> progresses. As we continue development, expect frequent changes and improvements, which may lead to breaking changes in
> some features. We appreciate your patience and feedback while we work on building a better and more stable version of
> this toolset.

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

1. First, you need to have the GitHub CLI (`gh`) installed. If you don’t already have it, you can install it from
   the [GitHub CLI documentation](https://cli.github.com/). It's available for all major operating systems, and trust
   me, it makes interacting with GitHub a lot easier.

2. Once you have `gh` installed, use the following command to clone the repository:

   ```bash
   gh repo clone nouns-build/builder-farcaster
   ```

   This command will clone the `nouns-build/builder-farcaster` repository into your local development environment.
   Ensure you run it from the desired directory where you want the repository files to be stored.

3. After cloning, you should see a new folder named `builder-farcaster` containing all the files of the repository. You
   can navigate into this folder to start working on the project.

### Step 3: Change Repository Origin and Push to GitHub

Now that you have the repository cloned locally, let's change the remote repository's origin to your new GitHub
repository and push the changes.

1. Navigate into the cloned repository:

   ```bash
   cd builder-farcaster
   ```

2. Change the Git remote origin to point to your own repository. Replace `<your-github-username>` and `<your-repo-name>`
   with your GitHub username and the repository name you created in Step 1:

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

   This command will push the local content to your newly created GitHub repository, making it available online for
   collaboration or deployment.

### Step 4: Set Environment Variables and Secrets

You can configure the environment variables and secrets either through the GitHub CLI as described below or directly
from your GitHub repository settings page, under the 'Settings' tab, by navigating to 'Secrets and variables'. These
configurations are essential for setting up the deployment and running the application in different environments.

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

2. Set the secrets using `gh` for sensitive information (Note: Secrets for Builder projects are available in the shared
   vault. If you are using this setup for personal purposes, you can obtain your API KEY by following the instructions
   here: [Public Programmable DCs v1](https://www.notion.so/warpcast/Public-Programmable-DCs-v1-50d9d99e34ac4d10add55bd26a91804f)):

   ```bash
   gh secret set SSH_PRIVATE_KEY
   gh secret set WARPCAST_API_KEY
   gh secret set WARPCAST_AUTH_TOKEN
   ```

   These commands will securely add environment variables and secrets to your GitHub repository. Properly setting these
   variables ensures your project has the right configuration to connect to the necessary services and environments.

## Deployment Instructions

### Step 1: Branching Strategy

1. **Create a Feature Branch**: Start by creating a feature branch from the `develop` branch. Use a descriptive branch
   name to make it easy to understand its purpose:

   ```bash
   git checkout -b feature/<feature-name>
   ```

   This ensures that ongoing changes are isolated and do not interfere with the main codebase until they are ready to be
   merged.

2. **Merge Changes into Develop**: Once your feature or bug fix is complete and reviewed, merge it back into the
   `develop` branch:

   ```bash
   git checkout develop
   git merge feature/<feature-name>
   ```

   The `develop` branch serves as the main integration branch where all ongoing development work is consolidated.

3. **Prepare for Release**: When the changes are ready for production, create a release branch from `develop`:

   ```bash
   git checkout -b release/<version-number>
   ```

   Release branches are meant for final preparation of a release, including testing and minor adjustments.

4. **Merge into Master**: After testing, merge the release branch into the `master` branch:

   ```bash
   git checkout master
   git merge release/<version-number>
   ```

   The `master` branch is the production-ready branch and should always reflect the latest stable version of the code.

5. **Tag the Release**: Tag the new version in line with Semantic Versioning (SemVer):

   ```bash
   git tag -a v<version-number> -m "Release version <version-number>"
   git push origin v<version-number>
   ```

   Tagging helps in keeping track of different versions of the project and makes it easier to roll back if needed.

6. **Update Version in Package File**: Update the version number in the `package.json` or equivalent package file before
   merging. This ensures consistency between the tagged version and the project metadata.

### Step 2: GitHub Release

1. **Generate Release**: Push the changes to the `master` branch. A GitHub release will automatically be generated from
   this push.

2. **Publish the Release**: Navigate to the releases page in the GitHub repository, edit the release notes if needed,
   and click **Publish Release**. This makes the new version officially available for use and further deployment.

### Step 3: Deployment Workflow

1. **Deployment Trigger**: Publishing the GitHub release will trigger a deployment workflow. This is an automated
   process that starts as soon as a new release is published.

2. **Build and Deploy**: The workflow will build the project and push it to the deployment server using the secrets and
   environment variables configured during the setup. The build process uses the environment configurations from the
   `master` branch to ensure consistency.

   The deployment process makes sure that the latest stable version is available in the production environment, and the
   environment variables are appropriately set to match the production settings.

3. **Verify Deployment**: Once deployed, verify the application is running as expected in the production environment.
   This may involve running some manual or automated tests to ensure everything is functioning correctly after the
   deployment.

## Branching and Versioning Strategy

In this repository, we keep ongoing changes on the `develop` branch, which acts as our main integration branch. When
changes are ready for production, we merge them into the `master` branch. Each merge to `master` is accompanied by a
proper SemVer tag, and the version number is updated in the package file accordingly.

Each time changes are pushed to the `master` branch under these conditions, a new GitHub release is generated. When you
publish a GitHub release, it triggers another workflow that builds the project and pushes it to the deployment server
using the secrets and variables provided during setup.

In this repository, we use a combination of Git Flow and GitHub Flow to manage our branching strategy. Git Flow helps us
structure our development process by using feature branches and releases, while GitHub Flow allows for a simplified
workflow for quick changes and collaboration.

For versioning, we follow Semantic Versioning (SemVer), which means version numbers follow the pattern
`MAJOR.MINOR.PATCH` and increment based on backward-incompatible changes, new features, and bug fixes, respectively.

By following these practices, we ensure a structured approach to development, testing, and releasing new versions of the
software, which helps in maintaining quality and reliability throughout the project lifecycle.

##
