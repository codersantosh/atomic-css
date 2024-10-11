const fs = require('fs');
const path = require('path');

// List of folders to remove .js files from
const folders = [
    'css-max',
    'css',
    'demo/colormode-globalstyle',
    'demo/colormode-globalstyle'
];

// Function to remove .js and .map files
function removeFiles(folder) {
    fs.readdir(folder, (err, files) => {
        if (err) {
            console.error(`Error reading directory: ${folder}`, err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(folder, file);
            const fileExt = path.extname(file);

            // Check if it's a .js or .map file
            if (fileExt === '.js' || fileExt === '.map') {
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, err => {
                        if (err) {
                            console.error(`Error deleting file: ${filePath}`, err);
                        } else {
                            console.log(`Deleted: ${filePath}`);
                        }
                    });
                } else {
                    console.log(`File not found, skipping: ${filePath}`);
                }
            }
        });
    });
}

// Run the function for each folder
folders.forEach(removeFiles);
