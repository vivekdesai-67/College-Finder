import * as fs from 'fs';
import * as path from 'path';

// Sample data for testing
const sampleData = `ENGINEERING CUTOFF RANK OF CET-2023 - 1st ROUND ALLOTMENT ( GENERAL )17-AUG-23 08:44 PM
1E001University of Visvesvaraya College of EngineeringBangalore ( PUBLIC UNIV. )1G1K1R2AG2AK2AR2BG2BK2BR3AG3AK3AR3BG3BK3BRGMGMKGMRSCGSCKSCRSTGSTKSTR
AI Artificial950718087--6191--95199240----4810----5160----42577979619826148--33645 24190--28919
Intelligence
CE Civil87651--96284 77746 83360 96248 80402--105256 61486--80200 67191 86716 82164 54199 64156 68346 89571 90786 98119 104430--105733
CS Computers4711----4503729656934589--71662769--46742889--470923813599459016022 17797 18002 14085 16438 20958`;

interface CutoffData {
  collegeCode: string;
  collegeName: string;
  location: string;
  branchCode: string;
  branchName: string;
  category: string;
  cutoffRank: number;
}

const CATEGORIES = [
  '1G', '1K', '1R',
  '2AG', '2AK', '2AR',
  '2BG', '2BK', '2BR',
  '3AG', '3AK', '3AR',
  '3BG', '3BK', '3BR',
  'GM', 'GMK', 'GMR',
  'SCG', 'SCK', 'SCR',
  'STG', 'STK', 'STR'
];

function parseKCET2023Data(rawData: string): CutoffData[] {
  const cutoffData: CutoffData[] = [];
  
  const collegeBlocks = rawData.split(/(?=\d+E\d+)/);
  
  for (const block of collegeBlocks) {
    if (!block.trim()) continue;
    
    const lines = block.split('\n').filter(l => l.trim());
    if (lines.length === 0) continue;
    
    const firstLine = lines[0];
    const collegeMatch = firstLine.match(/^(\d+E\d+)(.+?)1G1K1R/);
    
    if (!collegeMatch) continue;
    
    const collegeCode = collegeMatch[1];
    const collegeInfo = collegeMatch[2];
    
    let collegeName = '';
    let location = '';
    
    const locationMatch = collegeInfo.match(/(.+?)(Bangalore|Mysore|PUBLIC UNIV\.|PRIVATE)/i);
    
    if (locationMatch) {
      collegeName = locationMatch[1].trim();
      location = locationMatch[2].trim();
    } else {
      collegeName = collegeInfo.trim();
    }
    
    const currentCollege = { code: collegeCode, name: collegeName, location };
    
    console.log(`\nParsing college: ${currentCollege.code} - ${currentCollege.name}`);
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('1G1K1R2AG2AK') || line.includes('ENGINEERING CUTOFF')) continue;
      
      const branchMatch = line.match(/^([A-Z]{2})\s+(.+?)(\d+|--)/);
      
      if (branchMatch) {
        const branchCode = branchMatch[1];
        let branchName = branchMatch[2].trim();
        branchName = branchName.replace(/[\d\-\s]+$/, '').trim();
        
        const rankPattern = /(\d+|--)/g;
        const allMatches = line.match(rankPattern) || [];
        
        if (allMatches.length >= 24) {
          const ranks = allMatches.slice(-24);
          
          console.log(`  Branch: ${branchCode} - ${branchName}`);
          console.log(`  Found ${ranks.length} rank values`);
          
          let validRanks = 0;
          ranks.forEach((rank, index) => {
            if (rank !== '--' && !isNaN(parseInt(rank))) {
              cutoffData.push({
                collegeCode: currentCollege.code,
                collegeName: currentCollege.name,
                location: currentCollege.location,
                branchCode,
                branchName,
                category: CATEGORIES[index],
                cutoffRank: parseInt(rank)
              });
              validRanks++;
            }
          });
          
          console.log(`  Valid ranks: ${validRanks}`);
        }
      }
    }
  }
  
  return cutoffData;
}

// Test with sample data
console.log('Testing KCET 2023 parser...\n');
const result = parseKCET2023Data(sampleData);

console.log(`\n=== RESULTS ===`);
console.log(`Total cutoff records parsed: ${result.length}`);
console.log(`\nSample records:`);
result.slice(0, 5).forEach(r => {
  console.log(`${r.collegeCode} | ${r.branchCode} | ${r.category} | Rank: ${r.cutoffRank}`);
});

// Test with actual file if it exists
const dataPath = path.join(process.cwd(), 'kcet-2023-data.txt');
if (fs.existsSync(dataPath)) {
  console.log(`\n\nTesting with actual file...`);
  const fileData = fs.readFileSync(dataPath, 'utf-8');
  const fileResult = parseKCET2023Data(fileData);
  console.log(`Total records from file: ${fileResult.length}`);
}
