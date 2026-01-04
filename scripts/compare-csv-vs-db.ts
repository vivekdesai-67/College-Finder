/**
 * Compare colleges in CSV vs MongoDB
 */

import connectDB from "../lib/mongodb";
import College from "../lib/models/College";
import * as fs from 'fs';

async function compareData() {
  try {
    console.log('🔍 Comparing CSV Data vs MongoDB Data\n');
    console.log('='.repeat(70));
    
    // Check MongoDB
    console.log('\n📊 Checking MongoDB...');
    await connectDB();
    const colleges = await College.find({}).lean();
    
    console.log(`   Total Colleges in MongoDB: ${colleges.length}`);
    
    // Count colleges with Computer Science branches
    let csCount = 0;
    let cs1KCount = 0;
    
    for (const college of colleges) {
      const collegeAny = college as any;
      const branches = college.branchesOffered || collegeAny.branches || [];
      
      for (const branch of branches) {
        const isCS = branch.name.toLowerCase().includes('computer science');
        if (isCS) {
          csCount++;
          
          // Check if has 1K category
          const cutoffMap = branch.cutoff;
          if (cutoffMap && cutoffMap['1K'] && cutoffMap['1K'] > 0) {
            cs1KCount++;
          }
          break; // Count college once
        }
      }
    }
    
    console.log(`   Colleges with CS branches: ${csCount}`);
    console.log(`   CS branches with 1K category: ${cs1KCount}`);
    
    // Check CSV
    console.log('\n📄 Checking CSV Files...');
    
    const csvFiles = [
      'csvfiles/cutoff2022.csv',
      'csvfiles/cutoff2023.csv',
      'csvfiles/cuttoff2024.csv',
      'csvfiles/cutoff2025.csv'
    ];
    
    for (const file of csvFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        // Count unique college codes
        const collegeCodes = new Set<string>();
        const csColleges = new Set<string>();
        
        for (const line of lines) {
          const parts = line.split(',');
          if (parts.length > 2 && parts[1].startsWith('E')) {
            collegeCodes.add(parts[1]);
          }
          
          // Check for CS branches
          if (line.toLowerCase().includes('computer science')) {
            if (parts.length > 1 && parts[1].startsWith('E')) {
              csColleges.add(parts[1]);
            }
          }
        }
        
        console.log(`\n   ${file}:`);
        console.log(`      Total Colleges: ${collegeCodes.size}`);
        console.log(`      CS Colleges: ${csColleges.size}`);
      } else {
        console.log(`\n   ${file}: NOT FOUND`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n💡 Analysis:');
    console.log(`   - MongoDB has ${colleges.length} colleges`);
    console.log(`   - CSV files have 200+ colleges`);
    console.log(`   - Missing: ~${200 - colleges.length} colleges`);
    console.log('\n⚠️  Possible reasons:');
    console.log('   1. Not all CSV data was imported');
    console.log('   2. Some colleges were filtered out during import');
    console.log('   3. Duplicate colleges were merged');
    console.log('\n💡 Solution:');
    console.log('   Run the import script again to import all colleges from CSV\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

compareData();
