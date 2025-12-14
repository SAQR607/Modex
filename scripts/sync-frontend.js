const fs = require('fs');
const path = require('path');

/**
 * Sync Frontend Build to Backend Public
 * 
 * This script:
 * 1. Clears backend/public directory
 * 2. Copies all files from frontend/dist to backend/public
 * 3. Ensures backend/public exists
 */

const FRONTEND_DIST = path.join(__dirname, '../frontend/dist');
const BACKEND_PUBLIC = path.join(__dirname, '../backend/public');

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created directory: ${dirPath}`);
  }
}

function clearDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }
    console.log(`✓ Cleared directory: ${dirPath}`);
  }
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  ensureDirectory(destDir);
  fs.copyFileSync(src, dest);
}

function copyDirectory(src, dest) {
  ensureDirectory(dest);
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function syncFrontend() {
  console.log('='.repeat(60));
  console.log('Syncing Frontend Build to Backend Public');
  console.log('='.repeat(60));
  
  // Check if frontend/dist exists
  if (!fs.existsSync(FRONTEND_DIST)) {
    console.error('❌ Error: frontend/dist does not exist!');
    console.error('   Please run "npm run build:frontend" first.');
    process.exit(1);
  }
  
  // Check if frontend/dist/index.html exists
  const indexHtml = path.join(FRONTEND_DIST, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    console.error('❌ Error: frontend/dist/index.html not found!');
    console.error('   Frontend build may have failed.');
    process.exit(1);
  }
  
  console.log(`\n📦 Source: ${FRONTEND_DIST}`);
  console.log(`📦 Destination: ${BACKEND_PUBLIC}\n`);
  
  // Ensure backend/public exists
  ensureDirectory(BACKEND_PUBLIC);
  
  // Clear backend/public
  clearDirectory(BACKEND_PUBLIC);
  
  // Copy all files from frontend/dist to backend/public
  console.log('\n📋 Copying files...');
  copyDirectory(FRONTEND_DIST, BACKEND_PUBLIC);
  
  // Verify copy
  const copiedIndexHtml = path.join(BACKEND_PUBLIC, 'index.html');
  if (fs.existsSync(copiedIndexHtml)) {
    console.log('\n✅ Successfully synced frontend build to backend/public');
    console.log(`\n📄 Files copied:`);
    
    function listFiles(dir, prefix = '') {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(BACKEND_PUBLIC, fullPath);
        console.log(`   ${prefix}${relativePath}`);
        if (entry.isDirectory()) {
          listFiles(fullPath, prefix + '  ');
        }
      }
    }
    
    listFiles(BACKEND_PUBLIC);
    console.log('\n' + '='.repeat(60));
  } else {
    console.error('\n❌ Error: Copy verification failed!');
    process.exit(1);
  }
}

// Run sync
try {
  syncFrontend();
} catch (error) {
  console.error('\n❌ Error during sync:', error.message);
  process.exit(1);
}




