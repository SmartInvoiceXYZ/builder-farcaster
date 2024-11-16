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
