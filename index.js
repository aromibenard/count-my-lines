import fs from 'fs/promises';
import path from 'path';
import { globby } from 'globby';
import chalk from 'chalk';
import { createReadStream } from 'fs';
import { once } from 'events';
import os from 'os';
import pLimit from 'p-limit';

export async function countLines(dirPath, options = {}) {
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

    // count lines using streams
    async function countFileLines(filePath) {
        let lineCount = 0
        const stream = createReadStream(filePath, { 
            encoding: 'utf-8',
            highWaterMark: 1024 * 1024
        })

        stream.on('data', (chunk) => {
            lineCount += (chunk.match(/\n/g) || []).length
        })

        await once(stream, 'end')
        return lineCount
    }

    let totalLines = 0;
    let errorCount = 0;
    const fileCount = files.length;

    // process files in parallel with concurrency control
    const concurrency = os.cpus().length;
    const limit = (await import('p-limit')).default(concurrency)

    const results = await Promise.all(files.map(file => limit(async () => {
        try {
            const lineCount = await countFileLines(file)
            return { success: true, lines: lineCount }
        } catch (error) {
            console.error(chalk.red(`Error reading ${file}: ${error.message}`))
            return { success: false }
        }
    })))

    results.forEach(result => {
        if(result.success) {
            totalLines += result.lines
        } else {
            errorCount++
        }
    })

    return {
        totalLines,
        fileCount: files.length - errorCount,
        errorCount
    }
}
