import * as fs from 'fs';
import * as path from 'path';

interface CutoffEntry {
  collegeCode: string;
  collegeName: string;
  branch: string;
  branchCode: string;
  category: string;
  rank: number;
  year: number;
  round: string;
}

export function parseKCET2022Data(rawData: string): CutoffEntry[] {
  const entries: CutoffEntry[] = [];
  const lines = rawData.split('\n');
  
  let currentCollege = {
    code: '',
    name: '',
    location: ''
  };
  
  const categoryMap: { [key: string]: string } = {
    '1G': 'GM', '1K': 'GMK', '1R': 'GMR',
    '2AG': '2AG', '2AK': '2AK', '2AR': '2AR',
    '2BG': '2BG', '2BK': '2BK', '2BR': '2BR',
    '3AG': '3AG', '3AK': '3AK', '3AR': '3AR',
    '3BG': '3BG', '3BK': '3BK', '3BR': '3BR',
    'GM': 'GM', 'GMK': 'GMK', 'GMR': 'GMR',
    'SCG': 'SCG', 'SCK': 'SCK', 'SCR': 'SCR',
    'STG': 'STG', 'STK': 'STK', 'STR': 'STR'
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if this is a college header line
    const collegeMatch = line.match(/^(\d+)\s+E(\d+)\s+(.+?)(?:\s{2,}|\s+$)/);
    if (collegeMatch) {
      const [, , code, nameAndLocation] = collegeMatch;
      currentCollege.code = `E${code}`;
      
      // Extract college name and location
      const parts = nameAndLocation.split(/\s{2,}/);
      currentCollege.name = parts[0].trim();
      currentCollege.location = parts[parts.length - 1]?.trim() || '';
      
      continue;
    }
    
    // Check if this is a category header line
    if (line.match(/^[123][GKAR]|^GM|^SC|^ST/)) {
      continue;
    }
    
    // Parse branch data lines
    const branchMatch = line.match(/^([A-Z]{2})\s+(.+?)\s+(\d+)/);
    if (branchMatch && currentCollege.code) {
      const [, branchCode, branchName, ...rankData] = line.split(/\s+/);
      
      // Extract all numeric values (ranks) from the line
      const ranks = line.match(/\d+/g);
      if (!ranks || ranks.length < 3) continue;
      
      // Skip the first number if it's part of branch name
      const rankValues = ranks.slice(1);
      
      // Map ranks to categories (this is a simplified approach)
      // You'll need to adjust based on the exact column positions
      const categories = Object.keys(categoryMap);
      
      rankValues.forEach((rank, index) => {
        if (rank !== '--' && parseInt(rank) > 0 && index < categories.length) {
          entries.push({
            collegeCode: currentCollege.code,
            collegeName: currentCollege.name,
            branch: branchName.trim(),
            branchCode: branchCode,
            category: categoryMap[categories[index]] || categories[index],
            rank: parseInt(rank),
            year: 2022,
            round: 'FIRST'
          });
        }
      });
    }
  }
  
  return entries;
}

// Main execution
if (require.main === module) {
  const dataPath = path.join(process.cwd(), 'data', 'kcet-2022-raw.txt');
  const outputPath = path.join(process.cwd(), 'data', 'kcet-2022-parsed.json');
  
  try {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const parsedData = parseKCET2022Data(rawData);
    
    fs.writeFileSync(outputPath, JSON.stringify(parsedData, null, 2));
    console.log(`✅ Parsed ${parsedData.length} entries from KCET 2022 data`);
    console.log(`📁 Output saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error parsing KCET 2022 data:', error);
    process.exit(1);
  }
}
