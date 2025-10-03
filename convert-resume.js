#!/usr/bin/env node

/**
 * Resume Converter Script
 * Converts resume.md to various formats (docx, pdf, html)
 * Usage: node convert-resume.js [format]
 * Formats: docx (default), pdf, html
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RESUME_FILE = 'resume.md';
const OUTPUT_DIR = 'output';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkPandoc() {
  try {
    execSync('pandoc --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function installPandoc() {
  log('\n📦 Pandoc is not installed. Installing...', colors.yellow);
  log('This may take a minute...', colors.yellow);
  
  try {
    // Detect OS and install accordingly
    const platform = process.platform;
    
    if (platform === 'darwin') {
      log('Detected macOS. Installing via Homebrew...', colors.cyan);
      execSync('brew install pandoc', { stdio: 'inherit' });
    } else if (platform === 'linux') {
      log('Detected Linux. Installing via apt...', colors.cyan);
      execSync('sudo apt-get update && sudo apt-get install -y pandoc', { stdio: 'inherit' });
    } else if (platform === 'win32') {
      log('Please install Pandoc manually from: https://pandoc.org/installing.html', colors.red);
      process.exit(1);
    }
    
    log('✅ Pandoc installed successfully!', colors.green);
    return true;
  } catch (error) {
    log('❌ Failed to install Pandoc automatically.', colors.red);
    log('Please install manually from: https://pandoc.org/installing.html', colors.yellow);
    return false;
  }
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
    log(`✅ Created output directory: ${OUTPUT_DIR}`, colors.green);
  }
}

function convertToDocx() {
  const outputFile = path.join(OUTPUT_DIR, 'John_Young_Resume.docx');
  
  log('\n📝 Converting to DOCX format...', colors.cyan);
  
  try {
    execSync(
      `pandoc ${RESUME_FILE} -o ${outputFile} --from markdown --to docx`,
      { stdio: 'inherit' }
    );
    
    log(`✅ Successfully created: ${outputFile}`, colors.green);
    log(`   File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`, colors.reset);
    return outputFile;
  } catch (error) {
    log('❌ Failed to convert to DOCX', colors.red);
    return null;
  }
}

function convertToPdf() {
  const outputFile = path.join(OUTPUT_DIR, 'John_Young_Resume.pdf');
  
  log('\n📄 Converting to PDF format...', colors.cyan);
  
  try {
    execSync(
      `pandoc ${RESUME_FILE} -o ${outputFile} --from markdown --pdf-engine=pdflatex`,
      { stdio: 'inherit' }
    );
    
    log(`✅ Successfully created: ${outputFile}`, colors.green);
    log(`   File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`, colors.reset);
    return outputFile;
  } catch (error) {
    log('❌ Failed to convert to PDF', colors.red);
    log('   Note: PDF conversion requires LaTeX (pdflatex) to be installed', colors.yellow);
    return null;
  }
}

function convertToHtml() {
  const outputFile = path.join(OUTPUT_DIR, 'John_Young_Resume.html');
  
  log('\n🌐 Converting to HTML format...', colors.cyan);
  
  try {
    execSync(
      `pandoc ${RESUME_FILE} -o ${outputFile} --from markdown --to html --standalone --css=style.css`,
      { stdio: 'inherit' }
    );
    
    log(`✅ Successfully created: ${outputFile}`, colors.green);
    log(`   File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`, colors.reset);
    return outputFile;
  } catch (error) {
    log('❌ Failed to convert to HTML', colors.red);
    return null;
  }
}

function main() {
  log('\n' + '='.repeat(60), colors.bright);
  log('          📄 RESUME CONVERTER SCRIPT 📄', colors.bright + colors.cyan);
  log('='.repeat(60) + '\n', colors.bright);
  
  // Check if resume.md exists
  if (!fs.existsSync(RESUME_FILE)) {
    log(`❌ Error: ${RESUME_FILE} not found!`, colors.red);
    process.exit(1);
  }
  
  log(`✅ Found: ${RESUME_FILE}`, colors.green);
  
  // Check Pandoc installation
  if (!checkPandoc()) {
    const shouldInstall = true; // Auto-install for script
    if (shouldInstall && !installPandoc()) {
      process.exit(1);
    }
  } else {
    log('✅ Pandoc is installed', colors.green);
  }
  
  // Ensure output directory exists
  ensureOutputDir();
  
  // Get format from command line argument
  const format = process.argv[2] || 'docx';
  const formats = format.split(',').map(f => f.trim().toLowerCase());
  
  log(`\n🎯 Converting to format(s): ${formats.join(', ')}`, colors.bright);
  
  const results = [];
  
  // Convert to requested format(s)
  formats.forEach(fmt => {
    let result;
    switch (fmt) {
      case 'docx':
        result = convertToDocx();
        break;
      case 'pdf':
        result = convertToPdf();
        break;
      case 'html':
        result = convertToHtml();
        break;
      case 'all':
        results.push(convertToDocx());
        results.push(convertToPdf());
        results.push(convertToHtml());
        return;
      default:
        log(`❌ Unknown format: ${fmt}`, colors.red);
        log('   Supported formats: docx, pdf, html, all', colors.yellow);
        return;
    }
    if (result) results.push(result);
  });
  
  // Summary
  log('\n' + '='.repeat(60), colors.bright);
  log('✨ CONVERSION COMPLETE! ✨', colors.bright + colors.green);
  log('='.repeat(60), colors.bright);
  
  if (results.filter(r => r).length > 0) {
    log('\n📁 Output files:', colors.cyan);
    results.filter(r => r).forEach(file => {
      log(`   • ${file}`, colors.reset);
    });
    
    log('\n💡 Next steps:', colors.yellow);
    log('   1. Open the .docx file', colors.reset);
    log('   2. Upload to Google Drive', colors.reset);
    log('   3. Right-click → Open with → Google Docs', colors.reset);
    log('   Or: File → Upload → Select the .docx file', colors.reset);
  }
  
  log('');
}

// Run the script
main();
