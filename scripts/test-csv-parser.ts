// Test script to verify CSV parsing without database connection
import fs from 'fs';

// Sample CSV content for testing
const sampleCSV = `College Code,College Name,Location
1E001University of Visvesvaraya College of EngineeringBangalore
AI Artificial Intelligence 500 1200 1500 2000 2500 3000 3500 4000 4500
CS Computer Science 450 1100 1400 1900 2400 2900 3400 3900 4400
EC Electronics and Communication 600 1300 1600 2100 2600 3100 3600 4100 4600
ME Mechanical Engineering 800 1500 1800 2300 2800 3300 3800 4300 4800

1E002RV College of EngineeringBangalore
AI Artificial Intelligence 300 800 1000 1500 2000 2500 3000 3500 4000
CS Computer Science 250 700 900 1400 1900 2400 2900 3400 3900
EC Electronics and Communication 400 900 1100 1600 2100 2600 3100 3600 4100
`;

function parseCollegeName(rawName: string): { name: string; location: string; type: 'Government' | 'Private' | 'Autonomous' } {
  let name = rawName.trim();
  let location = 'Karnataka';
  let type: 'Government' | 'Private' | 'Autonomous' = 'Private';
  
  if (name.toLowerCase().includes('government')) {
    type = 'Government';
  } else if (name.toLowerCase().includes('autonomous')) {
    type = 'Autonomous';
  }
  
  const locationMatch = name.match(/(Bangalore|Bengaluru|Mysore|Mangalore|Belgaum|Hubli|Dharwad|Tumkur|Davangere|Gulbarga|Bidar|Hassan|Shimoga|Raichur|Bellary|Udupi|Mandya)/i);
  if (locationMatch) {
    location = locationMatch[1];
  }
  
  return { name, location, type };
}

function testParser(csvContent: string) {
  console.log('🧪 Testing CSV Parser\n');
  console.log('=' .repeat(60));
  
  const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
  
  let currentCollege: any = null;
  const colleges: any[] = [];
  
  for (const line of lines) {
    // Skip header lines
    if (line.toLowerCase().includes('college code') || 
        line.toLowerCase().includes('branch') ||
        line.toLowerCase().includes('cutoff')) {
      console.log('⏭️  Skipping header:', line.substring(0, 50));
      continue;
    }
    
    // Check if this is a college header line
    const collegeMatch = line.match(/^(\d+E\d+)(.+)$/);
    
    if (collegeMatch) {
      // Save previous college
      if (currentCollege && currentCollege.branches.length > 0) {
        colleges.push(currentCollege);
        console.log(`\n✅ Saved college: ${currentCollege.name}`);
        console.log(`   Branches: ${currentCollege.branches.length}`);
      }
      
      const [, code, rest] = collegeMatch;
      const { name, location, type } = parseCollegeName(rest);
      
      currentCollege = {
        code,
        name,
        location,
        type,
        branches: [],
      };
      
      console.log(`\n🏫 Found college:`);
      console.log(`   Code: ${code}`);
      console.log(`   Name: ${name}`);
      console.log(`   Location: ${location}`);
      console.log(`   Type: ${type}`);
      continue;
    }
    
    // Check if this is a branch line
    if (currentCollege) {
      const parts = line.split(/\s+/);
      
      if (parts.length > 2 && /^[A-Z]{2,4}$/.test(parts[0])) {
        // Extract branch name
        let branchName = '';
        let cutoffStart = 1;
        
        for (let i = 1; i < parts.length; i++) {
          if (/^\d+$/.test(parts[i])) {
            cutoffStart = i;
            break;
          }
          branchName += parts[i] + ' ';
        }
        
        branchName = branchName.trim();
        
        if (!branchName) continue;
        
        // Extract cutoff numbers
        const cutoffNumbers = parts.slice(cutoffStart)
          .filter(p => /^\d+$/.test(p))
          .map(Number)
          .filter(n => n > 0);
        
        if (cutoffNumbers.length === 0) continue;
        
        // Map to categories
        const cutoff: { [key: string]: number } = {};
        const categories = ['GM', '2AG', '2AR', '2BG', '2BR', '3AG', '3AR', '3BG', '3BR', 'SCG', 'SCR', 'STG', 'STR'];
        
        for (let j = 0; j < Math.min(cutoffNumbers.length, categories.length); j++) {
          cutoff[categories[j]] = cutoffNumbers[j];
        }
        
        currentCollege.branches.push({
          code: parts[0],
          name: branchName,
          cutoff,
        });
        
        console.log(`   📚 Branch: ${parts[0]} - ${branchName}`);
        console.log(`      Cutoffs: ${Object.entries(cutoff).slice(0, 3).map(([k, v]) => `${k}:${v}`).join(', ')}...`);
      }
    }
  }
  
  // Add last college
  if (currentCollege && currentCollege.branches.length > 0) {
    colleges.push(currentCollege);
    console.log(`\n✅ Saved college: ${currentCollege.name}`);
    console.log(`   Branches: ${currentCollege.branches.length}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   Total colleges parsed: ${colleges.length}`);
  console.log(`   Total branches: ${colleges.reduce((sum, c) => sum + c.branches.length, 0)}`);
  
  console.log('\n📋 Detailed Results:\n');
  colleges.forEach((college, i) => {
    console.log(`${i + 1}. ${college.name} (${college.location})`);
    console.log(`   Type: ${college.type}`);
    console.log(`   Code: ${college.code}`);
    console.log(`   Branches: ${college.branches.length}`);
    college.branches.forEach((branch: any) => {
      console.log(`      - ${branch.name} (${Object.keys(branch.cutoff).length} cutoffs)`);
    });
    console.log('');
  });
  
  return colleges;
}

// Test with sample data
console.log('Testing with sample CSV data...\n');
testParser(sampleCSV);

// Test with actual file if provided
const filePath = process.argv[2];
if (filePath && fs.existsSync(filePath)) {
  console.log('\n\n' + '='.repeat(60));
  console.log(`\nTesting with actual file: ${filePath}\n`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  testParser(fileContent);
} else if (filePath) {
  console.log(`\n⚠️  File not found: ${filePath}`);
  console.log('Usage: npm run test-parser [csv-file-path]');
}

console.log('\n✅ Test completed!');
