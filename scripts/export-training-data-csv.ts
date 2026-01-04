/**
 * Export all training data to CSV format
 * Includes historical cutoffs (2022-2025) and predictions
 */

import connectDB from "../lib/mongodb";
import College from "../lib/models/College";
import * as fs from 'fs';
import * as path from 'path';

interface CutoffRecord {
  collegeCode: string;
  collegeName: string;
  collegeType: string;
  location: string;
  branch: string;
  category: string;
  year: number;
  rank: number;
  round: string;
  dataSource: string; // 'historical' or 'current'
}

async function exportTrainingDataToCSV() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    console.log('📊 Fetching all colleges...');
    const colleges = await College.find({}).lean();

    console.log(`✅ Found ${colleges.length} colleges`);

    const allRecords: CutoffRecord[] = [];
    const categories = ['GM', '1G', '1K', '1R', '2AG', '2AK', '2AR', '2BG', '2BK', '2BR', '3AG', '3AK', '3AR', '3BG', '3BK', '3BR', 'SCG', 'SCK', 'SCR', 'STG', 'STK', 'STR'];

    // Process each college
    for (const college of colleges) {
      const collegeAny = college as any;
      const collegeCode = collegeAny.code || college._id?.toString() || 'UNKNOWN';
      const collegeName = college.name || 'Unknown College';
      const collegeType = college.type || 'Unknown';
      const location = college.location || 'Unknown';

      const branches = college.branchesOffered || collegeAny.branches || [];

      for (const branch of branches) {
        const branchName = branch.name;

        // Extract historical data
        if (branch.historicalData && Array.isArray(branch.historicalData)) {
          for (const historical of branch.historicalData) {
            const cutoffMap = historical.cutoff;
            
            if (cutoffMap && typeof cutoffMap === 'object') {
              // Handle both Map and plain object
              for (const category of categories) {
                const rank = cutoffMap instanceof Map 
                  ? cutoffMap.get(category) 
                  : cutoffMap[category];
                
                if (typeof rank === 'number' && rank > 0) {
                  allRecords.push({
                    collegeCode,
                    collegeName,
                    collegeType,
                    location,
                    branch: branchName,
                    category,
                    year: historical.year,
                    rank,
                    round: 'FIRST',
                    dataSource: 'historical'
                  });
                }
              }
            }
          }
        }

        // Extract current cutoff (2024)
        if (branch.cutoff) {
          const cutoffMap = branch.cutoff;
          
          if (cutoffMap && typeof cutoffMap === 'object') {
            for (const category of categories) {
              const rank = cutoffMap instanceof Map 
                ? cutoffMap.get(category) 
                : cutoffMap[category];
              
              if (typeof rank === 'number' && rank > 0) {
                // Check if 2024 already exists in historical data
                const has2024 = allRecords.some(r => 
                  r.collegeCode === collegeCode && 
                  r.branch === branchName && 
                  r.category === category && 
                  r.year === 2024
                );

                if (!has2024) {
                  allRecords.push({
                    collegeCode,
                    collegeName,
                    collegeType,
                    location,
                    branch: branchName,
                    category,
                    year: 2024,
                    rank,
                    round: 'FIRST',
                    dataSource: 'current'
                  });
                }
              }
            }
          }
        }
      }
    }

    console.log(`📝 Collected ${allRecords.length} cutoff records`);

    // Sort records
    allRecords.sort((a, b) => {
      if (a.collegeCode !== b.collegeCode) return a.collegeCode.localeCompare(b.collegeCode);
      if (a.branch !== b.branch) return a.branch.localeCompare(b.branch);
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.year - b.year;
    });

    // Create CSV content
    const csvHeader = 'College Code,College Name,College Type,Location,Branch,Category,Year,Rank,Round,Data Source\n';
    const csvRows = allRecords.map(record => 
      `"${record.collegeCode}","${record.collegeName}","${record.collegeType}","${record.location}","${record.branch}","${record.category}",${record.year},${record.rank},"${record.round}","${record.dataSource}"`
    ).join('\n');

    const csvContent = csvHeader + csvRows;

    // Save to file
    const outputDir = path.join(process.cwd(), 'data', 'exports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `kcet-training-data-${timestamp}.csv`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, csvContent, 'utf-8');

    console.log('\n✅ Export Complete!');
    console.log(`📁 File: ${filepath}`);
    console.log(`📊 Total Records: ${allRecords.length}`);
    console.log(`🏫 Colleges: ${colleges.length}`);
    
    // Statistics
    const yearStats = allRecords.reduce((acc, r) => {
      acc[r.year] = (acc[r.year] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    console.log('\n📈 Records by Year:');
    Object.entries(yearStats).sort().forEach(([year, count]) => {
      console.log(`   ${year}: ${count} records`);
    });

    const categoryStats = allRecords.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n🏷️  Records by Category:');
    Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} records`);
    });

    const branchStats = allRecords.reduce((acc, r) => {
      acc[r.branch] = (acc[r.branch] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📚 Top 10 Branches:');
    Object.entries(branchStats).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([branch, count]) => {
      console.log(`   ${branch}: ${count} records`);
    });

    return filepath;

  } catch (error) {
    console.error('❌ Error exporting data:', error);
    throw error;
  }
}

// Run the export
if (require.main === module) {
  exportTrainingDataToCSV()
    .then((filepath) => {
      console.log('\n🎉 Export successful!');
      console.log(`📂 Open: ${filepath}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Export failed:', error);
      process.exit(1);
    });
}

export { exportTrainingDataToCSV };
