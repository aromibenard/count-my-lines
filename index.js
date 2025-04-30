const fs = require('fs').promises;
const path = require('path');
const { globby } = require('globby');
const chalk = require('chalk');

async function countLines(dirPath, options = {}) {
    const {
        extensions = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'json'],
        ignore = ['node_modules', '.git', 'dist', 'build']
    } = options;

    // Prepare glob patterns
    const extPatterns = extensions.map(ext => `**/*.${ext}`);
    const ignorePatterns = ignore.map(pattern => `!**/${pattern}/**`);

    // Find all matching files
    const files = await globby([...extPatterns, ...ignorePatterns], {
        cwd: dirPath,
        absolute: true,
        gitignore: true
    });

    let totalLines = 0;
    const fileCount = files.length;

    // Process each file
    for (const file of files) {
        try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n').length;
        totalLines += lines;
        } catch (error) {
        console.error(chalk.red(`Error reading ${file}: ${error.message}`));
        }
    }

    return { totalLines, fileCount };
}

module.exports = { countLines };