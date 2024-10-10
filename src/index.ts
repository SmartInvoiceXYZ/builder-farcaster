import { handleActiveProposals } from '@/handlers/proposals-handlers'
import { consumeQueue } from '@/handlers/queues-handler'
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

const queueCommand = program
  .command('queues')
  .description('Queue related commands')
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

// Parse the command-line arguments
program.parse(process.argv)
