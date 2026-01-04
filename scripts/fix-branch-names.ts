import * as fs from 'fs';
import * as path from 'path';

// Mapping of abbreviated/incorrect branch names to full correct names
const branchNameMapping: Record<string, string> = {
  // AI/ML related
  "Artificial Intelligence & Machine Learning (AIML)": "Artificial Intelligence and Machine Learning",
  "Artificial Intelligence and Machine Learning (AIML)": "Artificial Intelligence and Machine Learning",
  "AI & ML": "Artificial Intelligence and Machine Learning",
  "AIML": "Artificial Intelligence and Machine Learning",
  "Artificial Intelligence & Data Science": "Artificial Intelligence and Data Science",
  "AI & Data Science": "Artificial Intelligence and Data Science",
  "Artificial Intelligence and Data Science": "Artificial Intelligence and Data Science",
  
  // Computer Science variants
  "Computer Science and Engineering": "Computer Science and Engineering",
  "Computer Science & Engineering": "Computer Science and Engineering",
  "CSE": "Computer Science and Engineering",
  "Computer Science and Engg": "Computer Science and Engineering",
  "Computer Science and Engg (AI & ML)": "Computer Science and Engineering (Artificial Intelligence and Machine Learning)",
  "Computer Science and Engineering (AI & ML)": "Computer Science and Engineering (Artificial Intelligence and Machine Learning)",
  "Computer Science and Engineering (Cyber Security)": "Computer Science and Engineering (Cyber Security)",
  "Computer Science and Engineering (Data Science)": "Computer Science and Engineering (Data Science)",
  "Computer Science and Design": "Computer Science and Design",
  
  // Information Science
  "Information Science and Engineering": "Information Science and Engineering",
  "Information Science & Engineering": "Information Science and Engineering",
  "ISE": "Information Science and Engineering",
  "Information Science and Engg": "Information Science and Engineering",
  
  // Electronics variants
  "Electronics and Communication Engg": "Electronics and Communication Engineering",
  "Electronics & Communication Engineering": "Electronics and Communication Engineering",
  "Electronics and Communication Engineering": "Electronics and Communication Engineering",
  "ECE": "Electronics and Communication Engineering",
  "E & C": "Electronics and Communication Engineering",
  
  "Electronics & Instrumentation Engineering": "Electronics and Instrumentation Engineering",
  "Electronics and Instrumentation Engineering": "Electronics and Instrumentation Engineering",
  
  "Electronics & Telecommunication Engineering": "Electronics and Telecommunication Engineering",
  "Electronics and Telecommunication Engineering": "Electronics and Telecommunication Engineering",
  
  // Electrical variants
  "Electrical & Electronics Engineering": "Electrical and Electronics Engineering",
  "Electrical and Electronics Engineering": "Electrical and Electronics Engineering",
  "EEE": "Electrical and Electronics Engineering",
  "E & E": "Electrical and Electronics Engineering",
  
  "Electrical & Communication Engineering": "Electrical and Communication Engineering",
  "Electrical and Communication Engineering": "Electrical and Communication Engineering",
  
  // Mechanical variants
  "Mechanical Engineering": "Mechanical Engineering",
  "ME": "Mechanical Engineering",
  
  // Civil variants
  "Civil Engineering": "Civil Engineering",
  "CE": "Civil Engineering",
  
  // Other branches
  "Data Science": "Data Science",
  "Intelligence": "Artificial Intelligence",
  "Biotechnology": "Biotechnology",
  "Chemical Engineering": "Chemical Engineering",
  "Industrial Engineering": "Industrial Engineering and Management",
  "Industrial Engineering & Management": "Industrial Engineering and Management",
  "Industrial Engineering and Management": "Industrial Engineering and Management",
  "Aeronautical Engineering": "Aeronautical Engineering",
  "Aerospace Engineering": "Aerospace Engineering",
  "Automobile Engineering": "Automobile Engineering",
  "Medical Electronics": "Medical Electronics",
  "Instrumentation Technology": "Instrumentation Technology",
  "Telecommunication Engineering": "Telecommunication Engineering",
  "Polymer Science": "Polymer Science and Technology",
  "Textile Technology": "Textile Technology",
  "Ceramics & Cement Engineering": "Ceramics and Cement Technology",
  "CERAMICS & CEMENT ENGINEERING": "Ceramics and Cement Technology",
  "Mining Engineering": "Mining Engineering",
  "Metallurgical Engineering": "Metallurgical Engineering",
  "Printing Technology": "Printing Technology",
  "Robotics & Automation": "Robotics and Automation",
  "Robotics and Automation": "Robotics and Automation",
  "Mechatronics": "Mechatronics Engineering",
  "Mechatronics Engineering": "Mechatronics Engineering",
};

function normalizeBranchName(name: string): string {
  // First try exact match
  if (branchNameMapping[name]) {
    return branchNameMapping[name];
  }
  
  // Try case-insensitive match
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(branchNameMapping)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  
  // If no match, apply some basic normalization rules
  let normalized = name
    .replace(/\s+&\s+/g, ' and ')  // Replace & with and
    .replace(/\s+Engg\b/g, ' Engineering')  // Replace Engg with Engineering
    .replace(/\bAI\b/g, 'Artificial Intelligence')
    .replace(/\bML\b/g, 'Machine Learning')
    .replace(/\bCSE\b/g, 'Computer Science and Engineering')
    .replace(/\bECE\b/g, 'Electronics and Communication Engineering')
    .replace(/\bEEE\b/g, 'Electrical and Electronics Engineering')
    .replace(/\bISE\b/g, 'Information Science and Engineering')
    .replace(/\bME\b/g, 'Mechanical Engineering')
    .replace(/\bCE\b/g, 'Civil Engineering')
    .trim();
  
  return normalized;
}

function fixBranchNamesInFile(filePath: string): void {
  console.log(`Processing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;
  
  // Find all branch name occurrences
  const branchNameRegex = /"name":\s*"([^"]+)"/g;
  
  content = content.replace(branchNameRegex, (match, branchName) => {
    // Skip if it's a college name (usually longer and contains location info)
    if (branchName.includes(',') || branchName.includes('College') || branchName.includes('University')) {
      return match;
    }
    
    const normalized = normalizeBranchName(branchName);
    if (normalized !== branchName) {
      changeCount++;
      console.log(`  "${branchName}" → "${normalized}"`);
      return `"name": "${normalized}"`;
    }
    return match;
  });
  
  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${changeCount} branch names in ${filePath}\n`);
  } else {
    console.log(`✓ No changes needed in ${filePath}\n`);
  }
}

// Main execution
const filesToFix = [
  'app/api/seed/route.ts',
  'app/api/seed/routees-clean.ts'
];

console.log('Starting branch name normalization...\n');

for (const file of filesToFix) {
  if (fs.existsSync(file)) {
    // Create backup
    const backupPath = `${file}.backup-${Date.now()}`;
    fs.copyFileSync(file, backupPath);
    console.log(`Created backup: ${backupPath}`);
    
    fixBranchNamesInFile(file);
  } else {
    console.log(`File not found: ${file}`);
  }
}

console.log('Branch name normalization complete!');
