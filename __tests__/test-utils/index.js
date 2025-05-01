const fs = require('fs/promises')
const path = require('path')

module.exports = {
        createTestFile: async (dir, filename, content) => {
        const filePath = path.join(dir, filename);
        await fs.writeFile(filePath, content);
        return filePath;
    },
    
    createTestDir: async (baseDir, dirname) => {
        const dirPath = path.join(baseDir, dirname);
        await fs.mkdir(dirPath, { recursive: true });
        return dirPath;
    }
};