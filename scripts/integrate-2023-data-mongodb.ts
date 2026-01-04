/**
 * Script to integrate KCET 2023 data into MongoDB
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
 * Parse the raw 2023 KCET data
 */
function parse2023Data(rawText: string): ParsedCutoff[] {
  const entries: ParsedCutoff[] = [];
  const lines = rawText.split('\n');
  
  const categories = ['GM', '1G', '1K', '1R', '2AG', '2AK', '2AR', '2BG', '2BK', '2BR', '3AG', '3AK', '3AR', '3BG', '3BK', '3BR', 'SCG', 'SCK', 'SCR', 'STG', 'STK', 'STR'];
  
  let currentCollege = { code: '', name: '', location: '' };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Match college header: "1E001University of Visvesvaraya..."
    const collegeMatch = line.match(/^(\d+)(E\d+)(.+?)(?:Bangalore|Bengaluru|Mysore|Mangalore|Hubli|Belgaum|Tumkur|Shimoga|Davangere|Gulbarga|Bijapur|Bellary)/i);
    if (collegeMatch) {
      currentCollege.code = collegeMatch[2];
      currentCollege.name = collegeMatch[3].trim();
      continue;
    }
    
    // Match branch data lines: "AI Artificial Intelligence 950 718 087..."
    const branchMatch = line.match(/^([A-Z]{2})\s+(.+?)\s+(\d+)/);
    if (branchMatch && currentCollege.code) {
      const branchCode = branchMatch[1];
      const parts = line.split(/\s+/);
      
      // Find where branch name ends (first number after branch code)
      let branchNameEnd = 2;
      while (branchNameEnd < parts.length && !/^\d+$/.test(parts[branchNameEnd]) && parts[branchNameEnd] !== '--') {
        branchNameEnd++;
      }
      
      const branchName = parts.slice(1, branchNameEnd).join(' ');
      const ranks = parts.slice(branchNameEnd);
      
      // Map ranks to categories (22 categories)
      for (let j = 0; j < Math.min(ranks.length, categories.length); j++) {
        const rank = ranks[j];
        if (rank !== '--' && rank !== '----' && /^\d+$/.test(rank)) {
          entries.push({
            collegeCode: currentCollege.code,
            collegeName: currentCollege.name,
            branch: branchName,
            branchCode: branchCode,
            category: categories[j],
            rank: parseInt(rank),
            year: 2023,
            round: 'FIRST'
          });
        }
      }
    }
  }
  
  return entries;
}

/**
 * Import 2023 data into MongoDB
 */
async function import2023Data() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    console.log('📖 Reading 2023 KCET data...');
    
    // Check if file exists
    const dataPath = path.join(process.cwd(), 'kcet-2023-data.txt');
    if (!fs.existsSync(dataPath)) {
      console.error(`❌ File not found: ${dataPath}`);
      console.log('💡 Please ensure kcet-2023-data.txt exists in project root');
      return;
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    
    console.log('🔍 Parsing 2023 data...');
    const parsedData = parse2023Data(rawData);
    
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
          
          // Check if 2023 data already exists
          const existing2023 = branch.historicalData.find(h => h.year === 2023);
          if (existing2023) {
            skippedCount++;
            continue;
          }
          
          // Create cutoff map
          const cutoffMap: any = {};
          for (const [category, rank] of Array.from(categoryMap.entries())) {
            cutoffMap[category] = rank;
          }
          
          // Add 2023 historical data
          branch.historicalData.push({
            year: 2023,
            cutoff: cutoffMap,
            placementRate: 0.80, // Default
            avgSalary: 700000    // Default
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
  import2023Data()
    .then(() => {
      console.log('\n✅ 2023 data integration complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Integration failed:', error);
      process.exit(1);
    });
}

export { parse2023Data, import2023Data };
