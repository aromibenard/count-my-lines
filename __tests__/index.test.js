import fs from 'fs/promises';
import path from 'path';
import { countLines } from '../index';

describe('countLines()', () => {
    const testDir = path.join(__dirname, 'fixtures')

    beforeAll(async () => {
        // Create test files structure
        await fs.mkdir(path.join(testDir, 'nested'), { recursive: true });
        await Promise.all([
            fs.writeFile(path.join(testDir, 'sample.js'), '// Sample\nconsole.log("hello");\n\n'),
            fs.writeFile(path.join(testDir, 'empty.js'), ''),
            fs.writeFile(path.join(testDir, 'nested/file.ts'), 'const x = 1;\nconst y = 2;')
        ]);

        afterAll(async () => {
            // Clean up test files
            await fs.rm(testDir, { recursive: true, force: true });
        })

        test('counts lines in all matching files', async () => {
            const result = await countLines(testDir, {
                extensions: ['js', 'ts'],
                ignore: []
            });

            expect(result.totalLines).toBe(5); // 3 from sample.js + 2 in file.ts
            expect(result.fileCount).toBe(2); 
            expect(result.errorCount).toBe(0);
        })

        test('respects ignore patterns', async () => {
            const result = await countLines(testDir, {
                extensions: ['js', 'ts'],
                ignore: ['nested']
            });

            expect(result.totalLines).toBe(3); // Only sample.js is counted
            expect(result.fileCount).toBe(1); 
        })

        test('handles empty directories', async () => {
            const emptyDir = path.join(testDir, 'empty-dir');
            await fs.mkdir(emptyDir);
            
            const result = await countLines(emptyDir);
            expect(result.totalLines).toBe(0);
            expect(result.fileCount).toBe(0);
        });

        test('counts binary files as 0 lines', async () => {
            await fs.writeFile(path.join(testDir, 'image.png'), Buffer.from([0x89, 0x50]));
            
            const result = await countLines(testDir, {
                extensions: ['png']
            });
            expect(result.totalLines).toBe(0); // Binary files should not be counted 
        })

    });
})