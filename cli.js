#!/usr/bin/env node

import { program } from 'commander';
import { countLines } from './index.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import os from 'os';

program
    .version(pkg.version)
    .description('📊 A CLI tool to count lines of code')
    .option('--concurrency <number>', 'set processing concurrency', Number, os.cpus().length)
    .argument('[path]', 'path to analyze (default: current directory)', '.')
    .option('-e, --extensions <extensions>', 'file extensions to include (comma separated)', 'js,jsx,ts,tsx,html,css,scss,json')
    .option('-i, --ignore <patterns>', 'ignore patterns (comma separated)', 'node_modules,.git,dist,build')
    .action(async (pathArg, options) => {
        const extensions = options.extensions.split(',');
        const ignore = options.ignore.split(',');
        const resolvedPath = path.resolve(process.cwd(), pathArg);

        const spinner = ora('Analyzing project...').start();
        
        try {
            const result = await countLines(resolvedPath, { extensions, ignore });
            spinner.succeed('Analysis complete!\n');
            console.log(`${chalk.bold('❌ Error count:')} ${chalk.red(result.errorCount)}`);
            if (options.verbose) {
                console.log('\n' + chalk.underline('Matched files:'));
                files.forEach(file => console.log(`- ${file}`));
            }

            console.log(chalk.yellow('────────────────────────────────────────────'));
            console.log(`${chalk.bold('📂 Path:')} ${chalk.green(resolvedPath)}`);
            console.log(`${chalk.bold('🗂️ Files analyzed:')} ${chalk.green(result.fileCount)}`);
            console.log(`${chalk.bold('📈 Total lines of code:')} ${chalk.green(result.totalLines)}`);
            console.log(chalk.yellow('────────────────────────────────────────────'));
        } catch (error) {
            spinner.fail('Analysis failed!');
            console.error(chalk.red('Error:'), error.message);
            process.exit(1);
        }
    })

    program.parse(process.argv);
