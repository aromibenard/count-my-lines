import { execSync } from 'child_process';
import path from 'path';

describe('CLI', () => {
    const cliPath = path.join(__dirname, '../cli.js');
    const testDir = path.join(__dirname, 'fixtures');
    
    test('shows version', () => {
        const output = execSync(`node ${cliPath} --version`).toString();
        expect(output).toMatch(/\d+\.\d+\.\d+/);
    });
    
    test('counts lines with default options', () => {
        const output = execSync(`node ${cliPath} ${testDir}`).toString();
        expect(output).toContain('Files analyzed');
        expect(output).toContain('Total lines of code');
    });
    
    test('respects --extensions flag', () => {
        const jsOnly = execSync(`node ${cliPath} ${testDir} --extensions js`).toString();
      expect(jsOnly).toContain('Files analyzed: 1'); // Only sample.js
    });
    
    test('handles invalid path gracefully', () => {
        try {
            execSync(`node ${cliPath} /nonexistent/path`);
        } catch (error) {
            expect(error.status).not.toBe(0);
            expect(error.stderr.toString()).toContain('Error');
        }
    });
});