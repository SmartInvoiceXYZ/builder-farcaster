import { handleActiveProposals } from '@/handlers/proposals-handlers'
import { Command } from 'commander'
import packageJson from '../package.json'

// Create a new command instance
const program = new Command()

// Set up metadata
program
  .name('builder-bot')
  .description('A simple CLI tool to manage tasks')
  .version(packageJson.version)

// Register commands
const processCommand = program
  .command('process')
  .description('Process related commands')
processCommand
  .command('proposals')
  .description('Process proposals from API and enqueue tasks')
  .action(handleActiveProposals)

// Parse the command-line arguments
program.parse(process.argv)
