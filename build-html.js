#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const posthtml = require('posthtml');
const posthtmlInclude = require('posthtml-include');

// Configuration
const config = {
  plugins: [
    posthtmlInclude({
      root: './src'
    })
  ]
};

// Source and output directories
const srcDir = 'src';
const distDir = 'dist';

// HTML files to process (relative to src directory)
const htmlFiles = [
  'index.html',
  'pages/catalog.html',
  'pages/about.html',
  'pages/contact.html',
  'pages/cart.html',
  'pages/product-details-template.html'
];

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy directory structure (excluding scss and dist)
function copyDirStructure(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory() && item !== 'scss' && item !== 'dist') {
      copyDirStructure(srcPath, destPath);
    } else if (stat.isFile() && item !== 'index.html') {
      // Copy all files except index.html (which will be processed)
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function buildHTML() {
  console.log('Building HTML files with PostHTML...');
  
  // Ensure dist directory exists
  ensureDir(distDir);
  
  // Copy assets and other files to dist
  copyDirStructure(srcDir, distDir);
  
  // CSS should already be compiled to dist/css by the build:css script
  
  for (const file of htmlFiles) {
    const srcFile = path.join(srcDir, file);
    const distFile = path.join(distDir, file);
    
    if (fs.existsSync(srcFile)) {
      try {
        // Ensure output directory exists
        const outputDir = path.dirname(distFile);
        ensureDir(outputDir);
        
        // Process HTML file
        const html = fs.readFileSync(srcFile, 'utf8');
        const result = await posthtml(config.plugins).process(html);
        
        // Write to dist directory
        fs.writeFileSync(distFile, result.html);
        console.log(`✓ Processed: ${srcFile} → ${distFile}`);
      } catch (error) {
        console.error(`✗ Error processing ${srcFile}:`, error.message);
      }
    } else {
      console.log(`⚠ Skipped (not found): ${srcFile}`);
    }
  }
  
  console.log('HTML build completed! Output saved to dist/ directory');
}

buildHTML().catch(console.error);