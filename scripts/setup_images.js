const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\56959\\.gemini\\antigravity\\brain\\bb34ad31-430d-4830-a2dd-0a5a37cf34ad';
const TARGET_DIR = path.join(__dirname, '..', 'public', 'images', 'products');

if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Map generated artifacts (by keyword) to target filenames
const MAPPINGS = [
    {
        keyword: 'rabbit_alfalfa_product',
        targets: ['rabbit-grow.jpg', 'rabbit-snack.jpg']
    },
    {
        keyword: 'guinea_pig_alfalfa_product',
        targets: ['cavy-junior.jpg', 'cavy-recover.jpg']
    },
    {
        keyword: 'chinchilla_alfalfa_product',
        targets: ['chin-growth.jpg', 'chin-fiber.jpg', 'rodent-nest.jpg', 'rodent-crisp.jpg'] // Reusing for rodents
    },
    {
        keyword: 'bird_alfalfa_product',
        targets: ['bird-boost.jpg', 'bird-nest.jpg']
    }
];

// Find latest file matching keyword
function findLatestArtifact(keyword) {
    const files = fs.readdirSync(ARTIFACTS_DIR)
        .filter(f => f.includes(keyword) && f.endsWith('.png'))
        .sort().reverse(); // simplistic latest
    return files.length > 0 ? path.join(ARTIFACTS_DIR, files[0]) : null;
}

MAPPINGS.forEach(group => {
    const sourcePath = findLatestArtifact(group.keyword);
    if (!sourcePath) {
        console.warn(`⚠️ No artifact found for ${group.keyword}`);
        return;
    }

    group.targets.forEach(targetFile => {
        const destPath = path.join(TARGET_DIR, targetFile);
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ ${targetFile} created from ${path.basename(sourcePath)}`);
    });
});
