#!/usr/bin/env node

const { program } = require('commander');
const { countLines } = require('./index');
const pkg = require('./package.json');
const path = require('path');
const ora = require('ora').default;
const chalk = require('chalk');

program
    .version(pkg.version)
    .description('📊 A CLI tool to count lines of code')
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
