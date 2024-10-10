import { handleActiveProposals } from '@/handlers/proposals-handlers'
import { consumeQueue } from '@/handlers/queues-handler'
import { Command } from 'commander'
import packageJson from '../package.json'

// Create a new Command instance for the CLI tool
const program = new Command()

// Set up the metadata for the CLI tool
program
  .name('builder-bot')
  .description('A simple CLI tool to manage tasks')
  .version(packageJson.version)

// Register the 'process' command
const processCommand = program
  .command('process')
  .description('Process related commands')

// Register the 'proposals' sub-command under 'process'
processCommand
  .command('proposals')
  .description('Process proposals from API and enqueue tasks')
  .action(handleActiveProposals)

// Register the 'queues' command
const queueCommand = program
  .command('queues')
  .description('Queue related commands')

// Register the 'consume' sub-command under 'queues'
queueCommand
  .command('consume')
  .description('Consume tasks from the queue')
  .option(
    '-l, --limit <number>',
    'Limit the number of tasks to consume',
    parseInt,
  )
  .action(async ({ limit }: { limit: number }) => {
    await consumeQueue(limit)
  })

// Parse the command-line arguments to execute appropriate commands
program.parse(process.argv)
