/**
 * Import ALL colleges from CSV files to MongoDB with historical data
 */

import connectDB from "../lib/mongodb";
import College from "../lib/models/College";
import * as fs from 'fs';
import * as path from 'path';

interface CutoffData {
  [category: string]: number | null;
}

interface BranchData {
  name: string;
  cutoff: CutoffData;
  historicalData: Array<{
    year: number;
    cutoff: CutoffData;
    round: string;
  }>;
}

interface CollegeData {
  code: string;
  name: string;
  location: string;
  type: string;
  branches: Map<string, BranchData>;
}

function parseCSV(filepath: string, year: number): Map<string, CollegeData> {
  console.log(`\n📄 Parsing ${path.basename(filepath)} for year ${year}...`);
  
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  
  const colleges = new Map<string, CollegeData>();
  let currentCollege: CollegeData | null = null;
  let categories: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',').map(p => p.trim());
    
    // Detect college header (starts with E code)
    if (parts.length > 2 && parts[1].match(/^E\d+/)) {
      const code = parts[1];
      const name = parts.slice(2).join(' ').trim();
      
      if (!colleges.has(code)) {
        colleges.set(code, {
          code,
          name,
          location: 'Karnataka',
          type: name.toLowerCase().includes('government') ? 'Government' : 'Private',
          branches: new Map()
        });
      }
      currentCollege = colleges.get(code)!;
      continue;
    }
    
    // Detect category headers
    if (line.includes('1G') && line.includes('GM')) {
      categories = parts.filter(p => p && /^(1G|1K|1R|2AG|2AK|2AR|2BG|2BK|2BR|3AG|3AK|3AR|3BG|3BK|3BR|GM|GMK|GMR|GMP|SCG|SCK|SCR|STG|STK|STR|NRI|OPN|OTH)$/.test(p));
      continue;
    }
    
    // Parse branch data
    if (currentCollege && categories.length > 0 && parts.length > 2) {
      const branchName = parts.slice(0, 2).join(' ').trim();
      if (!branchName || branchName.length < 3) continue;
      
      const cutoff: CutoffData = {};
      
      for (let j = 0; j < categories.length; j++) {
        const rankStr = parts[j + 2]?.replace(/--/g, '').replace(/\s/g, '');
        if (rankStr && rankStr.match(/^\d+(\.\d+)?$/)) {
          const rank = parseFloat(rankStr);
          if (rank > 0 && rank < 300000) {
            cutoff[categories[j]] = Math.round(rank);
          }
        }
      }
      
      if (Object.keys(cutoff).length > 0) {
        if (!currentCollege.branches.has(branchName)) {
          currentCollege.branches.set(branchName, {
            name: branchName,
            cutoff: {},
            historicalData: []
          });
        }
        
        const branch = currentCollege.branches.get(branchName)!;
        branch.historicalData.push({
          year,
          cutoff,
          round: 'FIRST'
        });
      }
    }
  }
  
  console.log(`   ✅ Parsed ${colleges.size} colleges`);
  return colleges;
}

async function importToMongoDB() {
  try {
    console.log('🚀 Starting CSV to MongoDB Import\n');
    console.log('='.repeat(70));
    
    await connectDB();
    
    // Parse all CSV files
    const csvFiles = [
      { file: 'csvfiles/cutoff2022.csv', year: 2022 },
      { file: 'csvfiles/cutoff2023.csv', year: 2023 },
      { file: 'csvfiles/cuttoff2024.csv', year: 2024 },
    ];
    
    const allColleges = new Map<string, CollegeData>();
    
    for (const { file, year } of csvFiles) {
      if (fs.existsSync(file)) {
        const yearColleges = parseCSV(file, year);
        
        // Merge with existing colleges
        yearColleges.forEach((college, code) => {
          if (!allColleges.has(code)) {
            allColleges.set(code, college);
          } else {
            const existing = allColleges.get(code)!;
            // Merge branches
            college.branches.forEach((branch, branchName) => {
              if (!existing.branches.has(branchName)) {
                existing.branches.set(branchName, branch);
              } else {
                // Merge historical data
                const existingBranch = existing.branches.get(branchName)!;
                existingBranch.historicalData.push(...branch.historicalData);
              }
            });
          }
        });
      } else {
        console.log(`   ⚠️  ${file} not found, skipping...`);
      }
    }
    
    console.log(`\n📊 Total colleges to import: ${allColleges.size}`);
    console.log('='.repeat(70));
    
    // Clear existing data
    console.log('\n🗑️  Clearing existing colleges...');
    await College.deleteMany({});
    console.log('   ✅ Cleared');
    
    // Import to MongoDB
    console.log('\n💾 Importing to MongoDB...');
    let imported = 0;
    let totalBranches = 0;
    
    for (const [code, college] of allColleges) {
      const branches = Array.from(college.branches.values()).map(branch => {
        // Use the most recent year's cutoff as the main cutoff
        const latestYear = Math.max(...branch.historicalData.map(h => h.year));
        const latestCutoff = branch.historicalData.find(h => h.year === latestYear)?.cutoff || {};
        
        return {
          name: branch.name,
          cutoff: latestCutoff,
          historicalData: branch.historicalData.sort((a, b) => a.year - b.year)
        };
      });
      
      if (branches.length > 0) {
        await College.create({
          code: college.code,
          name: college.name,
          location: college.location,
          type: college.type,
          fees: 100000,
          infraRating: 3,
          branchesOffered: branches
        });
        
        imported++;
        totalBranches += branches.length;
        
        if (imported % 50 === 0) {
          console.log(`   Progress: ${imported} colleges imported...`);
        }
      }
    }
    
    console.log(`\n✅ Import Complete!`);
    console.log('='.repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   Colleges Imported: ${imported}`);
    console.log(`   Total Branches: ${totalBranches}`);
    console.log(`   Average Branches per College: ${(totalBranches / imported).toFixed(1)}`);
    
    // Verify
    console.log(`\n🔍 Verification:`);
    const count = await College.countDocuments();
    console.log(`   Colleges in MongoDB: ${count}`);
    
    const sampleCollege = await College.findOne({}).lean();
    if (sampleCollege) {
      const collegeAny = sampleCollege as any;
      const branches = collegeAny.branchesOffered || [];
      console.log(`\n   Sample College: ${sampleCollege.name}`);
      console.log(`   Branches: ${branches.length}`);
      if (branches.length > 0) {
        console.log(`   Sample Branch: ${branches[0].name}`);
        console.log(`   Historical Data Years: ${branches[0].historicalData?.map((h: any) => h.year).join(', ') || 'None'}`);
      }
    }
    
    console.log('\n🎉 All done! You can now use the predictions page.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

importToMongoDB();
