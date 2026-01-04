// Batch import script to process all KCET CSV files
import fs from 'fs';
import path from 'path';
import connectDB from '../lib/mongodb';
import College from '../lib/models/College';
import { generateHistoricalData } from '../lib/generate-historical-data';

interface CollegeData {
  code: string;
  name: string;
  location: string;
  type: 'Government' | 'Private' | 'Autonomous';
  fees: number;
  infraRating: number;
  branchesOffered: any[];
}

// Parse college name and location
function parseCollegeName(rawName: string): { name: string; location: string; type: 'Government' | 'Private' | 'Autonomous' } {
  let name = rawName.trim();
  let location = 'Karnataka';
  let type: 'Government' | 'Private' | 'Autonomous' = 'Private';
  
  // Check for Government/Autonomous
  if (name.toLowerCase().includes('government')) {
    type = 'Government';
  } else if (name.toLowerCase().includes('autonomous')) {
    type = 'Autonomous';
  }
  
  // Extract location from common patterns
  const locationMatch = name.match(/(Bangalore|Bengaluru|Mysore|Mangalore|Belgaum|Hubli|Dharwad|Tumkur|Davangere|Gulbarga|Bidar|Hassan|Shimoga|Raichur|Bellary|Udupi|Mandya|Kolar|Chikmagalur|Bagalkot|Gadag|Haveri|Koppal|Chitradurga|Bijapur|Vijayapura)/i);
  if (locationMatch) {
    location = locationMatch[1];
  }
  
  return { name, location, type };
}

// Estimate placement rate
function estimatePlacementRate(collegeName: string, branchName: string): number {
  const isGovt = collegeName.toLowerCase().includes('government');
  const isTopCollege = collegeName.toLowerCase().includes('rv college') || 
                       collegeName.toLowerCase().includes('ramaiah') ||
                       collegeName.toLowerCase().includes('bms college') ||
                       collegeName.toLowerCase().includes('pes ') ||
                       collegeName.toLowerCase().includes('nitte');
  
  const isCSBranch = branchName.toLowerCase().includes('computer') || 
                     branchName.toLowerCase().includes('information') ||
                     branchName.toLowerCase().includes('ai') ||
                     branchName.toLowerCase().includes('artificial intelligence') ||
                     branchName.toLowerCase().includes('data science');
  
  let baseRate = 0.65;
  
  if (isTopCollege) baseRate = 0.90;
  else if (isGovt) baseRate = 0.75;
  
  if (isCSBranch) baseRate += 0.10;
  
  return Math.min(0.95, baseRate);
}

// Estimate average salary
function estimateAvgSalary(collegeName: string, branchName: string): number {
  const isTopCollege = collegeName.toLowerCase().includes('rv college') || 
                       collegeName.toLowerCase().includes('ramaiah') ||
                       collegeName.toLowerCase().includes('bms college') ||
                       collegeName.toLowerCase().includes('pes ') ||
                       collegeName.toLowerCase().includes('nitte');
  
  const isCSBranch = branchName.toLowerCase().includes('computer') || 
                     branchName.toLowerCase().includes('information') ||
                     branchName.toLowerCase().includes('ai') ||
                     branchName.toLowerCase().includes('artificial intelligence') ||
                     branchName.toLowerCase().includes('data science');
  
  let baseSalary = 450000; // 4.5 LPA
  
  if (isTopCollege) baseSalary = 800000; // 8 LPA
  if (isCSBranch) baseSalary += 200000; // +2 LPA for CS branches
  
  return baseSalary;
}

// Estimate industry growth
function estimateIndustryGrowth(branchName: string): number {
  const branchLower = branchName.toLowerCase();
  
  if (branchLower.includes('ai') || branchLower.includes('artificial intelligence') || 
      branchLower.includes('machine learning') || branchLower.includes('data science')) {
    return 0.95;
  }
  
  if (branchLower.includes('computer') || branchLower.includes('information') || 
      branchLower.includes('cyber security')) {
    return 0.85;
  }
  
  if (branchLower.includes('electronics') || branchLower.includes('electrical')) {
    return 0.70;
  }
  
  if (branchLower.includes('mechanical') || branchLower.includes('civil')) {
    return 0.55;
  }
  
  return 0.60;
}

// Parse a single CSV file
function parseCSVFile(filePath: string): CollegeData[] {
  const colleges: CollegeData[] = [];
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentCollege: CollegeData | null = null;
    
    for (const line of lines) {
      // Skip header lines
      if (line.toLowerCase().includes('college code') || 
          line.toLowerCase().includes('branch') ||
          line.toLowerCase().includes('cutoff')) {
        continue;
      }
      
      // Check if this is a college header line
      // Format: "1E001University of Visvesvaraya College of EngineeringBangalore"
      const collegeMatch = line.match(/^(\d+E\d+)(.+)$/);
      
      if (collegeMatch) {
        // Save previous college if exists
        if (currentCollege && currentCollege.branchesOffered.length > 0) {
          colleges.push(currentCollege);
        }
        
        const [, code, rest] = collegeMatch;
        const { name, location, type } = parseCollegeName(rest);
        
        currentCollege = {
          code,
          name,
          location,
          type,
          fees: type === 'Government' ? 50000 : type === 'Autonomous' ? 100000 : 150000,
          infraRating: type === 'Government' ? 4 : 3,
          branchesOffered: [],
        };
        continue;
      }
      
      // Check if this is a branch line
      // Format: "AI Artificial Intelligence 500 1200 1500 ..."
      if (currentCollege) {
        const parts = line.split(/\s+/);
        
        // Branch code is usually 2-3 uppercase letters at the start
        if (parts.length > 2 && /^[A-Z]{2,4}$/.test(parts[0])) {
          // Extract branch name (everything before the first number)
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
          
          // Map numbers to categories
          const cutoff: { [key: string]: number } = {};
          const categories = ['GM', '2AG', '2AR', '2BG', '2BR', '3AG', '3AR', '3BG', '3BR', 'SCG', 'SCR', 'STG', 'STR'];
          
          for (let j = 0; j < Math.min(cutoffNumbers.length, categories.length); j++) {
            cutoff[categories[j]] = cutoffNumbers[j];
          }
          
          // Generate branch data
          const placementRate = estimatePlacementRate(currentCollege.name, branchName);
          const avgSalary = estimateAvgSalary(currentCollege.name, branchName);
          const industryGrowth = estimateIndustryGrowth(branchName);
          
          // Generate historical data (2020-2024)
          const historicalData = generateHistoricalData(
            branchName,
            cutoff,
            placementRate,
            avgSalary
          );
          
          currentCollege.branchesOffered.push({
            name: branchName,
            cutoff,
            placementRate,
            avgSalary,
            maxSalary: avgSalary * 2.5,
            admissionTrend: 0.7,
            industryGrowth,
            historicalData,
          });
        }
      }
    }
    
    // Add last college
    if (currentCollege && currentCollege.branchesOffered.length > 0) {
      colleges.push(currentCollege);
    }
    
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
  }
  
  return colleges;
}

// Main batch import function
async function batchImportKCETData(dataDir: string) {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    
    console.log('📂 Reading CSV files from:', dataDir);
    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.csv'))
      .sort();
    
    console.log(`📊 Found ${files.length} CSV files`);
    
    if (files.length === 0) {
      console.log('❌ No CSV files found in the directory');
      return;
    }
    
    let totalColleges = 0;
    let totalBranches = 0;
    const allColleges = new Map<string, CollegeData>();
    
    // Parse all CSV files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(dataDir, file);
      
      console.log(`\n📖 Processing ${i + 1}/${files.length}: ${file}`);
      
      const colleges = parseCSVFile(filePath);
      
      // Merge colleges (in case same college appears in multiple files)
      for (const college of colleges) {
        if (allColleges.has(college.name)) {
          const existing = allColleges.get(college.name)!;
          existing.branchesOffered.push(...college.branchesOffered);
        } else {
          allColleges.set(college.name, college);
        }
      }
      
      console.log(`   ✅ Parsed ${colleges.length} colleges`);
    }
    
    console.log(`\n📊 Total unique colleges: ${allColleges.size}`);
    
    // Insert into MongoDB
    console.log('\n💾 Inserting into MongoDB...');
    let insertedCount = 0;
    let updatedCount = 0;
    
    const collegeEntries = Array.from(allColleges.values());
    
    for (const collegeData of collegeEntries) {
      try {
        const result = await College.findOneAndUpdate(
          { name: collegeData.name },
          collegeData,
          { upsert: true, new: true }
        );
        
        if (result) {
          insertedCount++;
          totalBranches += collegeData.branchesOffered.length;
        } else {
          updatedCount++;
        }
        
        if (insertedCount % 10 === 0) {
          console.log(`   ✅ Processed ${insertedCount} colleges...`);
        }
      } catch (error) {
        console.error(`   ❌ Error inserting ${collegeData.name}:`, error);
      }
    }
    
    console.log('\n✅ Import completed successfully!');
    console.log(`📊 Statistics:`);
    console.log(`   - Colleges processed: ${insertedCount}`);
    console.log(`   - Total branches: ${totalBranches}`);
    console.log(`   - CSV files processed: ${files.length}`);
    console.log(`\n🎯 ML prediction model is now ready with real KCET 2024 data!`);
    console.log(`📈 Historical data (2020-2024) generated for all branches`);
    
  } catch (error) {
    console.error('❌ Batch import failed:', error);
    throw error;
  }
}

// Run the batch import
const dataDir = process.argv[2] || './data';

if (!fs.existsSync(dataDir)) {
  console.error(`❌ Directory not found: ${dataDir}`);
  console.log('\nUsage: npm run import-kcet <data-directory>');
  console.log('Example: npm run import-kcet ./kcet-data');
  process.exit(1);
}

batchImportKCETData(dataDir)
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
