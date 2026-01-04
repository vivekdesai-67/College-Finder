// Script to import KCET 2024 cutoff data and generate historical data for ML training
import fs from 'fs';
import connectDB from '../lib/mongodb';
import College from '../lib/models/College';
import { generateHistoricalData } from '../lib/generate-historical-data';

// Parse college name and location from the data
function parseCollegeName(rawName: string): { name: string; location: string; type: 'Government' | 'Private' | 'Autonomous' } {
  let name = rawName;
  let location = 'Karnataka';
  let type: 'Government' | 'Private' | 'Autonomous' = 'Private';
  
  // Check for Government/Autonomous
  if (rawName.toLowerCase().includes('government')) {
    type = 'Government';
  } else if (rawName.toLowerCase().includes('autonomous')) {
    type = 'Autonomous';
  }
  
  // Extract location from common patterns
  const locationMatch = rawName.match(/(Bangalore|Bengaluru|Mysore|Mangalore|Belgaum|Hubli|Dharwad|Tumkur|Davangere|Gulbarga|Bidar|Hassan|Shimoga|Raichur|Bellary|Udupi|Mandya)/i);
  if (locationMatch) {
    location = locationMatch[1];
  }
  
  return { name, location, type };
}

// Estimate placement rate based on college type and branch
function estimatePlacementRate(collegeName: string, branchName: string): number {
  const isGovt = collegeName.toLowerCase().includes('government');
  const isTopCollege = collegeName.toLowerCase().includes('rv college') || 
                       collegeName.toLowerCase().includes('ramaiah') ||
                       collegeName.toLowerCase().includes('bms college');
  
  const isCSBranch = branchName.toLowerCase().includes('computer') || 
                     branchName.toLowerCase().includes('information') ||
                     branchName.toLowerCase().includes('ai') ||
                     branchName.toLowerCase().includes('data science');
  
  let baseRate = 0.65;
  
  if (isTopCollege) baseRate = 0.90;
  else if (isGovt) baseRate = 0.75;
  
  if (isCSBranch) baseRate += 0.10;
  
  return Math.min(0.95, baseRate);
}

// Estimate average salary based on branch and college
function estimateAvgSalary(collegeName: string, branchName: string): number {
  const isTopCollege = collegeName.toLowerCase().includes('rv college') || 
                       collegeName.toLowerCase().includes('ramaiah') ||
                       collegeName.toLowerCase().includes('bms college');
  
  const isCSBranch = branchName.toLowerCase().includes('computer') || 
                     branchName.toLowerCase().includes('information') ||
                     branchName.toLowerCase().includes('ai') ||
                     branchName.toLowerCase().includes('data science');
  
  let baseSalary = 450000; // 4.5 LPA
  
  if (isTopCollege) baseSalary = 800000; // 8 LPA
  if (isCSBranch) baseSalary += 200000; // +2 LPA for CS branches
  
  return baseSalary;
}

// Estimate industry growth based on branch
function estimateIndustryGrowth(branchName: string): number {
  const branchLower = branchName.toLowerCase();
  
  if (branchLower.includes('ai') || branchLower.includes('artificial intelligence') || 
      branchLower.includes('machine learning') || branchLower.includes('data science')) {
    return 0.95; // Very high growth
  }
  
  if (branchLower.includes('computer') || branchLower.includes('information') || 
      branchLower.includes('cyber security')) {
    return 0.85; // High growth
  }
  
  if (branchLower.includes('electronics') || branchLower.includes('electrical')) {
    return 0.70; // Moderate growth
  }
  
  if (branchLower.includes('mechanical') || branchLower.includes('civil')) {
    return 0.55; // Stable
  }
  
  return 0.60; // Default
}

// Main import function
async function importKCETData(csvFilePath: string) {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    
    console.log('📖 Reading CSV file...');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Parse CSV (you'll need to adjust based on actual CSV structure)
    const lines = fileContent.split('\n');
    
    const collegesMap = new Map<string, any>();
    
    let currentCollege: any = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;
      
      // Check if this is a college header line (starts with college code like "1E001")
      const collegeMatch = line.match(/^(\d+E\d+)(.+?)(\w+)$/);
      
      if (collegeMatch) {
        const [, code, collegeName, location] = collegeMatch;
        const { name, location: loc, type } = parseCollegeName(collegeName + location);
        
        currentCollege = {
          code,
          name: name.trim(),
          location: loc,
          type,
          fees: type === 'Government' ? 50000 : type === 'Autonomous' ? 100000 : 150000,
          infraRating: type === 'Government' ? 4 : 3,
          branchesOffered: [],
        };
        
        collegesMap.set(code, currentCollege);
        continue;
      }
      
      // Check if this is a branch line
      if (currentCollege && line.match(/^[A-Z]{2,3}\s/)) {
        const parts = line.split(/\s+/);
        const branchCode = parts[0];
        const branchName = parts.slice(1).join(' ').split(/\d/)[0].trim();
        
        // Extract cutoff ranks (remaining numbers in the line)
        const numbers = line.match(/\d+/g)?.map(Number) || [];
        
        if (branchName && numbers.length > 0) {
          // Map numbers to categories (GM, 2AG, 2AR, 3AG, 3AR, 3BG, 3BR, SCG, STG, etc.)
          const cutoff: any = {};
          const categories = ['GM', '2AG', '2AR', '2BG', '2BR', '3AG', '3AR', '3BG', '3BR', 'SCG', 'SCR', 'STG', 'STR'];
          
          for (let j = 0; j < Math.min(numbers.length, categories.length); j++) {
            if (numbers[j] > 0) {
              cutoff[categories[j]] = numbers[j];
            }
          }
          
          // Only add if we have at least one cutoff
          if (Object.keys(cutoff).length > 0) {
            const placementRate = estimatePlacementRate(currentCollege.name, branchName);
            const avgSalary = estimateAvgSalary(currentCollege.name, branchName);
            const industryGrowth = estimateIndustryGrowth(branchName);
            
            // Generate historical data for 2022-2024
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
    }
    
    console.log(`📊 Parsed ${collegesMap.size} colleges`);
    
    // Insert into MongoDB
    console.log('💾 Inserting into MongoDB...');
    let insertedCount = 0;
    
    const collegeEntries = Array.from(collegesMap.entries());
    for (const [, collegeData] of collegeEntries) {
      if (collegeData.branchesOffered.length > 0) {
        try {
          await College.findOneAndUpdate(
            { name: collegeData.name },
            collegeData,
            { upsert: true, new: true }
          );
          insertedCount++;
          
          if (insertedCount % 10 === 0) {
            console.log(`✅ Inserted ${insertedCount} colleges...`);
          }
        } catch (error) {
          console.error(`❌ Error inserting ${collegeData.name}:`, error);
        }
      }
    }
    
    console.log(`\n✅ Successfully imported ${insertedCount} colleges with historical data!`);
    console.log('🎯 ML prediction model is now ready to use!');
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  }
}

// Run the import
const csvFilePath = process.argv[2] || './data/kcet-2024.csv';
importKCETData(csvFilePath)
  .then(() => {
    console.log('✅ Import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });
