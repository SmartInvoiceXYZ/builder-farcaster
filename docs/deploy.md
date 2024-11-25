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

4. **Update Version in Package File**: Update the version number in the `package.json` or equivalent package file before
   merging. This ensures consistency between the tagged version and the project metadata.

5. **Merge into Master**: After testing, merge the release branch into the `master` branch:

   ```bash
   git checkout master
   git merge release/<version-number>
   ```

   The `master` branch is the production-ready branch and should always reflect the latest stable version of the code.

6. **Tag the Release**: Tag the new version in line with Semantic Versioning (SemVer):

   ```bash
   git tag -a v<version-number> -m "Release version <version-number>"
   git push origin v<version-number>
   ```

   Tagging helps in keeping track of different versions of the project and makes it easier to roll back if needed.

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
