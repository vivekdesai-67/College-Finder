/**
 * Script to integrate KCET 2022 data into MongoDB
 * Adds historical data to branchesOffered.historicalData array
 */

import connectDB from "../lib/mongodb";
import College from "../lib/models/College";
import * as fs from 'fs';
import * as path from 'path';

interface ParsedCutoff {
  collegeCode: string;
  collegeName: string;
  branch: string;
  branchCode: string;
  category: string;
  rank: number;
  year: number;
  round: string;
}

/**
 * Parse the raw 2022 KCET data
 */
function parse2022Data(rawText: string): ParsedCutoff[] {
  const entries: ParsedCutoff[] = [];
  const lines = rawText.split('\n');
  
  let currentCollege = { code: '', name: '', location: '' };
  let categoryHeaders: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Match college header: "1     E001   University of Visvesvaraya..."
    const collegeMatch = line.match(/^\d+\s+(E\d+)\s+(.+?)(?:\s{2,}|\t)/);
    if (collegeMatch) {
      currentCollege.code = collegeMatch[1];
      const nameLocation = collegeMatch[2].trim();
      const parts = nameLocation.split(/\s{2,}/);
      currentCollege.name = parts[0];
      currentCollege.location = parts[parts.length - 1] || '';
      continue;
    }
    
    // Match category headers
    if (line.match(/^1G\s+1K\s+1R\s+2AG/)) {
      categoryHeaders = line.split(/\s+/).filter(h => h.length > 0);
      continue;
    }
    
    // Match branch data lines
    const branchMatch = line.match(/^([A-Z]{2})\s+(.+?)\s+(\d+)/);
    if (branchMatch && currentCollege.code) {
      const branchCode = branchMatch[1];
      const parts = line.split(/\s+/);
      
      // Find where branch name ends (first number after branch code)
      let branchNameEnd = 2;
      while (branchNameEnd < parts.length && !/^\d+$/.test(parts[branchNameEnd])) {
        branchNameEnd++;
      }
      
      const branchName = parts.slice(1, branchNameEnd).join(' ');
      const ranks = parts.slice(branchNameEnd);
      
      // Map ranks to categories
      ranks.forEach((rank, index) => {
        if (rank !== '--' && /^\d+$/.test(rank) && index < categoryHeaders.length) {
          entries.push({
            collegeCode: currentCollege.code,
            collegeName: currentCollege.name,
            branch: branchName,
            branchCode: branchCode,
            category: categoryHeaders[index],
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

/**
 * Import 2022 data into MongoDB
 */
async function import2022Data() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    console.log('📖 Reading 2022 KCET data...');
    
    // Check if file exists
    const dataPath = path.join(process.cwd(), 'data', 'kcet-2022-raw.txt');
    if (!fs.existsSync(dataPath)) {
      console.error(`❌ File not found: ${dataPath}`);
      console.log('💡 Please create data/kcet-2022-raw.txt with 2022 cutoff data');
      return;
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    
    console.log('🔍 Parsing 2022 data...');
    const parsedData = parse2022Data(rawData);
    
    console.log(`✅ Parsed ${parsedData.length} cutoff entries`);
    
    // Group by college and branch
    const collegeMap = new Map<string, Map<string, Map<string, number>>>();
    
    for (const entry of parsedData) {
      if (!collegeMap.has(entry.collegeName)) {
        collegeMap.set(entry.collegeName, new Map());
      }
      const branchMap = collegeMap.get(entry.collegeName)!;
      
      if (!branchMap.has(entry.branch)) {
        branchMap.set(entry.branch, new Map());
      }
      const categoryMap = branchMap.get(entry.branch)!;
      
      categoryMap.set(entry.category, entry.rank);
    }
    
    console.log(`📊 Found ${collegeMap.size} unique colleges`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;
    
    for (const [collegeName, branchMap] of Array.from(collegeMap.entries())) {
      try {
        // Find college by name (fuzzy match)
        const college = await College.findOne({
          name: { $regex: collegeName.substring(0, 20), $options: 'i' }
        });
        
        if (!college) {
          console.log(`⚠️  College not found: ${collegeName}`);
          notFoundCount++;
          continue;
        }
        
        // Update each branch
        for (const [branchName, categoryMap] of Array.from(branchMap.entries())) {
          // Find matching branch
          const branch = college.branchesOffered.find(b => 
            b.name.toLowerCase().includes(branchName.toLowerCase().substring(0, 15)) ||
            branchName.toLowerCase().includes(b.name.toLowerCase().substring(0, 15))
          );
          
          if (!branch) {
            console.log(`⚠️  Branch not found: ${branchName} in ${collegeName}`);
            continue;
          }
          
          // Initialize historicalData if not exists
          if (!branch.historicalData) {
            branch.historicalData = [];
          }
          
          // Check if 2022 data already exists
          const existing2022 = branch.historicalData.find(h => h.year === 2022);
          if (existing2022) {
            skippedCount++;
            continue;
          }
          
          // Create cutoff map
          const cutoffMap: any = {};
          for (const [category, rank] of Array.from(categoryMap.entries())) {
            cutoffMap[category] = rank;
          }
          
          // Add 2022 historical data
          branch.historicalData.push({
            year: 2022,
            cutoff: cutoffMap,
            placementRate: 0.75, // Default
            avgSalary: 600000    // Default
          } as any);
          
          updatedCount++;
        }
        
        // Save college
        await college.save();
        console.log(`✅ Updated: ${college.name}`);
        
      } catch (error) {
        console.error(`❌ Error processing college ${collegeName}:`, error);
      }
    }
    
    console.log('\n📊 Import Summary:');
    console.log(`✅ Updated: ${updatedCount} branches`);
    console.log(`⏭️  Skipped: ${skippedCount} (already exist)`);
    console.log(`⚠️  Not Found: ${notFoundCount} colleges`);
    console.log(`🏫 Total Colleges: ${collegeMap.size}`);
    
  } catch (error) {
    console.error('❌ Fatal error during import:', error);
    throw error;
  }
}

// Run the import
if (require.main === module) {
  import2022Data()
    .then(() => {
      console.log('\n✅ 2022 data integration complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Integration failed:', error);
      process.exit(1);
    });
}

export { parse2022Data, import2022Data };
