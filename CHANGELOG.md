# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0-beta.0] - 2024-11-04

### 🚜 Refactor

- *(warpcast)* Simplify `getFollowers` method

## [1.0.0-alpha.35] - 2024-11-01

### 🚀 Features

- *(builder)* Filter active proposals by current time

### 🚜 Refactor

- *(proposals-handlers)* Process proposals notifications sequentially

## [1.0.0-alpha.34] - 2024-11-01

### 🚀 Features

- *(handlers)* Enhance voting message with proposal URL

### 🚜 Refactor

- *(queues-handler)* Simplify `proposal` and `daos` types

## [1.0.0-alpha.33] - 2024-11-01

### 🐛 Bug Fixes

- *(proposals-handlers)* Correct voting time comparison

## [1.0.0-alpha.32] - 2024-10-31

### 🐛 Bug Fixes

- *(proposals-handlers)* Filter active proposals by vote start date

### 🚜 Refactor

- *(builder)* Extract and centralize endpoint variables
- *(builder)* Add chain info to endpoints and daos
- *(services)* Unify proposal fetching methods
- *(handlers)* Streamline voting proposals notification
- *(proposals-handlers)* Streamline ending proposals handling

### ⚙️ Miscellaneous Tasks

- *(package)* Add resolution for elliptic dependency

## [1.0.0-alpha.31] - 2024-10-30

### ◀️ Revert

- *(workflows)* Add monthly cron job to process invites

## [1.0.0-alpha.30] - 2024-10-30

### 🚜 Refactor

- *(queues-handler)* Break long message strings into lines

## [1.0.0-alpha.29] - 2024-10-30

### 🚜 Refactor

- *(handlers)* Clean dao names and update message format

## [1.0.0-alpha.28] - 2024-10-30

### 🚜 Refactor

- *(queues-handler)* Simplify message generation for DAO notifications

## [1.0.0-alpha.27] - 2024-10-30

### 🚀 Features

- *(builder)* Add method to fetch DAO token owners
- *(cli)* Add invites processing command
- *(builder)* Increase default value for `first` to 1000
- *(warpcast)* Add `getUserByVerification` service
- *(builder)* Add `ownerCount` to `Dao` interface

### 🐛 Bug Fixes

- *(invites-handler)* Use `continue` instead of `return` for loop

### 🚜 Refactor

- *(builder)* Rename `daotokenOwners` to `owners`
- *(services)* Restructure `getDAOsTokenOwners` pagination logic
- *(invites-handler)* Enhance owner to DAOs mapping
- *(handlers)* Extract follower and user functions
- *(invites-handler)* Map DAO owners to Farcaster users
- *(invites-handler)* Restructure and improve error handling
- *(invites-handler)* Add caching to invites handler
- *(invites-handler)* Relocate `handleInvites` function
- *(invites-handler)* Add `ownerCount` to `Dao` mapping
- *(invites-handler)* Log size of `sortedFidToDaoMap`
- *(invites-handler)* Add follower filtering for DAOs
- *(invites-handler)* Enhance logging for invite sorting
- *(invites-handler)* Enable scheduled invitation logic
- *(invites-handler)* Add debug logging for `fidDaoEntries` count
- *(queues-handler)* Add support for invitation tasks
- *(queues-handler)* Enhance notification messages
- *(invites-handler)* Remove unnecessary time checks

### ⚙️ Miscellaneous Tasks

- *(scripts)* Add `dev:invites` script to `package.json`
- *(workflows)* Add monthly cron job to process invites
- *(workflows)* Update cron schedule for invite processing

## [1.0.0-alpha.26] - 2024-10-28

### 🚀 Features

- *(builder)* Add `getActiveEndingProposals` service
- *(proposals-handlers)* Add ending proposals notifications
- *(handlers)* Enhance proposal handling logic
- *(handlers)* Enhance proposal notification processing

### 🐛 Bug Fixes

- *(builder)* Update proposal sorting and filtering logic
- *(handlers)* Update cache key in `handleActiveProposals`
- *(proposals-handlers)* Update proposals time range to 3 days
- *(builder)* Correct comparison operator in GraphQL query

### 🚜 Refactor

- *(builder)* Add new types and remove local interfaces
- *(handlers)* Rename `getActiveProposals` to `getActiveVotingProposals`
- *(handlers)* Rename and refactor proposal handling functions
- *(handlers)* Rename proposal handling methods
- *(proposals-handlers)* Rename `endTime` to `voteEnd`

## [1.0.0-alpha.25] - 2024-10-27

### 🚀 Features

- *(proposals-handlers)* Validate follower addresses

### 🚜 Refactor

- *(builder)* Rename `DaoTokenOwner` and `daotokenOwners`

### ⚙️ Miscellaneous Tasks

- *(gitignore)* Update `.gitignore` for graphql config
- *(graphql)* Move `builder.graphql` to `schemas` directory

## [1.0.0-alpha.24] - 2024-10-27

### 🎨 Styling

- *(graphql)* Rename `builder.gql` to `builder.graphql`

### ⚙️ Miscellaneous Tasks

- *(gitignore)* Add graphql configuration to .gitignore

## [1.0.0-alpha.23] - 2024-10-19

### ⚙️ Miscellaneous Tasks

- *(deploy)* Move prisma db copy step to install phase

## [1.0.0-alpha.22] - 2024-10-19

### ⚙️ Miscellaneous Tasks

- *(deploy)* Add step to copy prisma db files during deployment

## [1.0.0-alpha.21] - 2024-10-15

### ⚙️ Miscellaneous Tasks

- *(deploy)* Remove excluded SQLite files before rsync

## [1.0.0-alpha.20] - 2024-10-15

### ⚙️ Miscellaneous Tasks

- *(deploy)* Update deploy workflow to refine file inclusion

## [1.0.0-alpha.19] - 2024-10-15

### ⚙️ Miscellaneous Tasks

- *(deploy)* Update rsync rules for prisma files
- *(scripts)* Update `prepare` script to handle errors

## [1.0.0-alpha.18] - 2024-10-15

### ⚙️ Miscellaneous Tasks

- *(deploy)* Update rsync include patterns for prisma

### ◀️ Revert

- *(deploy)* Add tty allocation to ssh commands

## [1.0.0-alpha.17] - 2024-10-15

### ◀️ Revert

- *(deploy)* Update rsync include patterns for prisma

## [1.0.0-alpha.16] - 2024-10-15

### ⚙️ Miscellaneous Tasks

- *(deploy)* Update rsync include patterns for prisma
- *(deploy)* Add tty allocation to ssh commands

## [1.0.0-alpha.15] - 2024-10-15

### ⚙️ Miscellaneous Tasks

- *(deploy)* Remove rsync inline comments

## [1.0.0-alpha.14] - 2024-10-15

### 🐛 Bug Fixes

- *(warpcast)* Type-cast response json to `FetchResponse`

### ⚙️ Miscellaneous Tasks

- *(scripts)* Update dev and build scripts
- *(scripts)* Update and streamline build scripts
- *(deploy)* Update rsync to exclude SQLite files
- *(workflows)* Optimize PNPM store caching
- *(workflows)* Streamline deploy script comments

## [1.0.0-alpha.13] - 2024-10-15

### 🐛 Bug Fixes

- Solve some minor issues and update dependencies

## [1.0.0-alpha.12] - 2024-10-14

### ⚙️ Miscellaneous Tasks

- *(deploy)* Add logs directory and update log paths
- *(deploy)* Update cron job frequency and command

## [1.0.0-alpha.11] - 2024-10-14

### ⚙️ Miscellaneous Tasks

- *(deploy)* Update cron job setup in `deploy.yml`

## [1.0.0-alpha.10] - 2024-10-14

### ⚙️ Miscellaneous Tasks

- *(deploy)* Set up crontab tasks in deploy workflow

## [1.0.0-alpha.9] - 2024-10-14

### ⚙️ Miscellaneous Tasks

- *(deploy)* Add `NODE_ENV` to environment file creation
- *(deploy)* Add prisma migration and generation steps

## [1.0.0-alpha.8] - 2024-10-14

### ⚙️ Miscellaneous Tasks

- *(deploy)* Include LICENSE file in deployment
- *(scripts)* Update `prepare` script to handle errors

## [1.0.0-alpha.7] - 2024-10-14

### ⚙️ Miscellaneous Tasks

- *(deploy)* Reorder steps for environment setup

## [1.0.0-alpha.6] - 2024-10-14

### 📚 Documentation

- *(package)* Update `description` with project details

### ⚙️ Miscellaneous Tasks

- *(workflows)* Remove usage guard job in `build.yml`
- *(workflows)* Enhance deploy pipeline with SSH and build steps

## [1.0.0-alpha.5] - 2024-10-12

### ⚙️ Miscellaneous Tasks

- *(deploy)* Update environment variables in `deploy.yml`
- *(build)* Add `DATABASE_URL` to build pipeline

## [1.0.0-alpha.4] - 2024-10-12

### 🐛 Bug Fixes

- *(proposals-handlers)* Remove unnecessary cache age parameter

### 🚜 Refactor

- *(cache)* Make `maxAgeMs` optional in `getCache`
- *(queues-handler)* Improve task processing flow

### 📚 Documentation

- *(handlers)* Add jsdoc for `consumeQueue` function
- *(cli)* Enhance command descriptions

### 🎨 Styling

- *(types)* Update import statements to use `type`

### ⚙️ Miscellaneous Tasks

- *(env)* Add `.env.template` for environment variables
- *(scripts)* Update `prebuild` and add `pretest` script
- *(vite)* Remove cjs format in build config

## [1.0.0-alpha.3] - 2024-10-10

### 🚀 Features

- *(prisma)* Add Queue model to database schema
- *(queue)* Add task queue management functions
- *(config)* Add `WARPCAST_API_KEY` to env schema
- *(warpcast)* Add `sendDirectCast` service method
- *(queue)* Generate unique task IDs in `addToQueue`
- *(index)* Add proposals to notification queue
- *(queue)* Add retries functionality to tasks
- *(utils)* Add `toRelativeTime` function
- *(vite)* Add node polyfills plugin
- *(cli)* Add command-line interface for proposal handling
- *(utils)* Enhance `toRelativeTime` function units
- *(queue)* Add queue processing and notification handling
- *(utils)* Add `isPast` function to check past timestamps
- *(queues-handler)* Enhance proposal time messages

### 🐛 Bug Fixes

- *(builder)* Change proposal sorting order to asc

### 🚜 Refactor

- *(index)* Move proposal handling logic to `proposals-handlers`

### 🎨 Styling

- *(queues-handler)* Enhance proposal message format

### ⚙️ Miscellaneous Tasks

- *(gitignore)* Ignore `dev.db-journal` in `prisma`
- *(scripts)* Update `start` script to process proposals
- *(vite)* Remove unused node polyfills plugin
- *(prettier)* Add prisma plugin to `.prettierrc.json`
- *(scripts)* Update `test` script to allow no tests

## [1.0.0-alpha.2] - 2024-10-09

### 🚀 Features

- *(builder)* Add `Env` interface to `types.ts`
- *(config)* Add builder subgraph URLs to env schema
- *(services)* Add `getDAOsForOwners` to fetch DAO data
- *(build)* Enhance `vite.config.ts` for better build process
- *(index)* Fetch and cache DAOs for follower fids
- *(builder)* Add `getActiveProposals` function
- *(index)* Add proposal caching and fetching logic
- *(logger)* Set log level based on environment
- *(builder)* Add `name` field to dao in proposals

### 🐛 Bug Fixes

- *(index)* Log `verificationAddresses` object on fetch
- *(builder)* Remove redundant vote time filters
- *(index)* Log comprehensive debug information

### 🚜 Refactor

- *(types)* Update `Env` type to include `BuilderEnv`
- *(builder)* Rename `fetch-daos-for-owners` to `get-daos-for-owners`
- *(cache)* Standardize cache keys with `toString` method
- *(index)* Simplify type imports and references
- *(index)* Extract follower caching logic to function
- *(index)* Extract `getFollowerAddresses` function
- *(index)* Extract dao fetching logic to `getFollowerDAOs`
- *(index)* Extract `getUserFid` function
- *(index)* Remove redundant log data and rename vars
- *(logging)* Simplify and structure logging details
- *(logger)* Restructure log messages for clarity
- *(index)* Consolidate follower processing logic
- *(index)* Reorder logic for proposal handling
- *(index)* Simplify follower address and DAOs check
- *(index)* Streamline data fetching and caching
- *(index)* Extract active proposals handling to function
- *(index)* Add logging for proposal processing

### ⚙️ Miscellaneous Tasks

- *(tsconfig)* Change moduleResolution to `bundler`

## [1.0.0-alpha.1] - 2024-10-09

### 🚀 Features

- *(index)* Enhance logging and configuration management
- *(env)* Add environment variable validation
- *(types)* Add `Env` type for environment configurations
- *(warpcast)* Add functionality to fetch user followers
- *(logger)* Configure pino logger for development
- *(services)* Add `getMe` function to warpcast service
- *(logger)* Add custom logger using pino
- *(index)* Add follower retrieval functionality
- *(cache)* Add cache management with `PrismaClient`
- *(prisma)* Add initial Prisma schema for caching
- *(migrations)* Add initial cache table
- *(cache)* Add caching for `getMe` and `getFollowers`
- *(services)* Add `getVerifications` method to `warpcast`
- *(index)* Add caching for follower verifications

### 🐛 Bug Fixes

- *(package)* Set correct entry point in `main`
- *(package)* Update start script to run correct entry point

### 🚜 Refactor

- *(index)* Simplify server initialization
- *(tsconfig)* Simplify and update configuration
- *(index)* Simplify self-executing function
- *(config)* Rename `env.ts` to `config.ts` and update types
- *(index)* Replace `dotenv` with custom `config` module
- *(index)* Replace inline logger with external logger
- *(index)* Cache user fid instead of entire user object
- *(cache)* Update type for `getCache` method
- *(index)* Update import paths to use aliases

### ⚙️ Miscellaneous Tasks

- *(gitignore)* Update ignore list for lock file
- *(package)* Add `start` script to `package.json`
- *(build)* Add initial `tsconfig.json` for TypeScript setup
- *(scripts)* Add `clean` script to remove `dist` folder
- *(build)* Switch from pnpm to bun for setup and build
- *(scripts)* Add `lint` script using `eslint`
- *(package)* Add `type` field to `package.json`
- *(lint-staged)* Add `lint-staged` config for code formatting
- *(linting)* Add ESLint configuration
- *(cliff)* Add git-cliff configuration
- *(style)* Add prettier configuration
- *(husky)* Add pre-commit hook for linting and testing
- *(scripts)* Add vite commands for development and build
- *(config)* Add vite configuration
- *(build)* Update start script to use node
- *(tsconfig)* Add path alias for src directory
- *(vite)* Add vite-tsconfig-paths plugin
- *(vite)* Update build config for es module and externals
- *(scripts)* Update start script to use esm module
- *(eslint)* Update ignores in eslint config
- *(tsconfig)* Update compiler settings for esnext
- *(scripts)* Update `start` script to use `index.js`
- *(vite)* Update build target and output file name
- *(vite)* Add `@prisma/client` to external dependencies
- *(gitignore)* Add `prisma/dev.db` to ignored files
- *(scripts)* Add `prebuild` script to `package.json`
- *(scripts)* Add `prestart` script to run build

### ◀️ Revert

- *(build)* Switch from pnpm to bun for setup and build

## [1.0.0-alpha.0] - 2024-10-07

### 🚀 Features

- *(graphql)* Add GraphQL schema for auctions and DAOs

### 📚 Documentation

- *(readme)* Update project title
- *(readme)* Add project badges and warning section

### ⚙️ Miscellaneous Tasks

- *(style)* Add `.editorconfig` for consistent code style
- Add `.gitignore` for common NodeJS and project files
- *(npm)* Add `.npmrc` to enforce exact versioning
- *(templates)* Add GitHub issue templates
- *(workflows)* Add comprehensive CI/CD workflows
- *(dependabot)* Add configuration for dependency updates
- *(ci)* Add FUNDING file for GitHub sponsor links
- *(stale-bot)* Add configuration for stale issues

<!-- generated by git-cliff -->
