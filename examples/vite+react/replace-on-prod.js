const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');

// Read the package.json file
fs.readFile(packageJsonPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading package.json:', err);
        return;
    }

    // Parse the JSON data
    const packageJson = JSON.parse(data);

    // Replace the idb-ts version with the latest
    if (packageJson.dependencies && packageJson.dependencies['idb-ts']) {
        packageJson.dependencies['idb-ts'] = 'latest';
    }

    // Convert the JSON object back to a string
    const updatedPackageJson = JSON.stringify(packageJson, null, 2);

    // Write the updated package.json back to the file
    fs.writeFile(packageJsonPath, updatedPackageJson, 'utf8', (err) => {
        if (err) {
            console.error('Error writing package.json:', err);
            return;
        }

        console.log('package.json updated successfully.');
    });
});