import * as fs from 'fs';
import connectDB from '../lib/mongodb';
import College from '../lib/models/College';

interface CutoffRecord {
  year: number;
  collegeCode: string;
  collegeName: string;
  branch: string;
  category: string;
  rank: number;
}

function parseCSVFile(filePath: string, year: number): CutoffRecord[] {
  console.log(`\nParsing ${filePath} for year ${year}...`);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const records: CutoffRecord[] = [];
  let currentCollege = '';
  let currentCollegeCode = '';
  let categories: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Parse college info
    if (line.includes('College:') || line.match(/^\d+,E\d+/)) {
      const parts = line.split(',');
      if (parts.length > 2) {
        currentCollegeCode = parts[1]?.trim() || '';
        currentCollege = parts[2]?.trim() || '';
      }
      continue;
    }
    
    // Parse category headers
    if (line.includes('1G') && line.includes('GM')) {
      categories = line.split(',').map(c => c.trim()).filter(c => c);
      continue;
    }
    
    // Parse branch data
    if (currentCollege && categories.length > 0) {
      const parts = line.split(',');
      if (parts.length > 3) {
        const branchName = (parts[0]?.trim() + ' ' + parts[1]?.trim()).trim();
        
        if (!branchName || branchName.length < 3) continue;
        
        // Parse ranks for each category
        for (let j = 2; j < Math.min(parts.length, categories.length + 2); j++) {
          const rankStr = parts[j]?.trim().replace(/--/g, '').replace(/\s+/g, '');
          if (rankStr && rankStr !== '' && !isNaN(Number(rankStr))) {
            const rank = parseInt(rankStr);
            const category = categories[j - 2];
            
            if (rank > 0 && rank < 300000 && category) {
              records.push({
                year,
                collegeCode: currentCollegeCode,
                collegeName: currentCollege,
                branch: branchName,
                category,
                rank
              });
            }
          }
        }
      }
    }
  }
  
  console.log(`  Extracted ${records.length} records`);
  return records;
}

async function importHistoricalData() {
  console.log('=== Importing Historical Cutoff Data ===\n');
  
  await connectDB();
  
  const csvFiles = [
    { path: 'csvfiles/cutoff2022.csv', year: 2022 },
    { path: 'csvfiles/cutoff2023.csv', year: 2023 },
    { path: 'csvfiles/cuttoff2024.csv', year: 2024 },
  ];
  
  // Parse all CSV files
  let allRecords: CutoffRecord[] = [];
  for (const file of csvFiles) {
    if (fs.existsSync(file.path)) {
      const records = parseCSVFile(file.path, file.year);
      allRecords = allRecords.concat(records);
    } else {
      console.log(`Warning: ${file.path} not found`);
    }
  }
  
  console.log(`\nTotal records collected: ${allRecords.length}`);
  
  // Group by college code and branch
  const groupedData = new Map<string, Map<string, CutoffRecord[]>>();
  
  for (const record of allRecords) {
    if (!groupedData.has(record.collegeCode)) {
      groupedData.set(record.collegeCode, new Map());
    }
    
    const collegeData = groupedData.get(record.collegeCode)!;
    if (!collegeData.has(record.branch)) {
      collegeData.set(record.branch, []);
    }
    
    collegeData.get(record.branch)!.push(record);
  }
  
  console.log(`\nGrouped into ${groupedData.size} colleges`);
  
  // Update colleges in database
  let updatedCount = 0;
  let notFoundCount = 0;
  
  for (const [collegeCode, branchesData] of Array.from(groupedData.entries())) {
    // Find college by code
    const college = await College.findOne({ code: collegeCode });
    
    if (!college) {
      notFoundCount++;
      console.log(`College not found: ${collegeCode}`);
      continue;
    }
    
    // Update each branch with historical data
    for (const [branchName, records] of Array.from(branchesData.entries())) {
      // Find matching branch (normalize names for comparison)
      const branch = college.branchesOffered.find((b: any) => 
        b.name.toLowerCase().includes(branchName.toLowerCase().substring(0, 20)) ||
        branchName.toLowerCase().includes(b.name.toLowerCase().substring(0, 20))
      );
      
      if (!branch) {
        continue;
      }
      
      // Group records by year
      const yearlyData = new Map<number, Map<string, number>>();
      
      for (const record of records) {
        if (!yearlyData.has(record.year)) {
          yearlyData.set(record.year, new Map());
        }
        yearlyData.get(record.year)!.set(record.category, record.rank);
      }
      
      // Create historical data array
      const historicalData = Array.from(yearlyData.entries()).map(([year, cutoffMap]) => ({
        year,
        cutoff: Object.fromEntries(cutoffMap)
      }));
      
      // Update branch with historical data
      branch.historicalData = historicalData;
    }
    
    // Save updated college
    await college.save();
    updatedCount++;
    
    if (updatedCount % 10 === 0) {
      console.log(`Updated ${updatedCount} colleges...`);
    }
  }
  
  console.log(`\n✓ Import complete!`);
  console.log(`  Updated: ${updatedCount} colleges`);
  console.log(`  Not found: ${notFoundCount} colleges`);
  
  process.exit(0);
}

importHistoricalData().catch(error => {
  console.error('Import error:', error);
  process.exit(1);
});
