import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import connectDB from '@/lib/mongodb';
import College from '@/lib/models/College';

interface CutoffRecord {
  year: number;
  collegeCode: string;
  branch: string;
  category: string;
  rank: number;
}

function parseCSVFile(filePath: string, year: number): CutoffRecord[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const records: CutoffRecord[] = [];
  let currentCollegeCode = '';
  let categories: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Parse college code
    if (trimmed.match(/^\d+,E\d+/)) {
      const parts = trimmed.split(',');
      currentCollegeCode = parts[1]?.trim() || '';
      continue;
    }
    
    // Parse category headers
    if (trimmed.includes('1G') && trimmed.includes('GM')) {
      categories = trimmed.split(',').map(c => c.trim()).filter(c => c);
      continue;
    }
    
    // Parse branch data
    if (currentCollegeCode && categories.length > 0) {
      const parts = trimmed.split(',');
      if (parts.length > 3) {
        const branchName = (parts[0]?.trim() + ' ' + parts[1]?.trim()).trim();
        if (!branchName || branchName.length < 3) continue;
        
        for (let j = 2; j < Math.min(parts.length, categories.length + 2); j++) {
          const rankStr = parts[j]?.trim().replace(/--/g, '').replace(/\s+/g, '');
          if (rankStr && !isNaN(Number(rankStr))) {
            const rank = parseInt(rankStr);
            const category = categories[j - 2];
            
            if (rank > 0 && rank < 300000 && category) {
              records.push({ year, collegeCode: currentCollegeCode, branch: branchName, category, rank });
            }
          }
        }
      }
    }
  }
  
  return records;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const csvFiles = [
      { path: path.join(process.cwd(), 'csvfiles/cutoff2022.csv'), year: 2022 },
      { path: path.join(process.cwd(), 'csvfiles/cutoff2023.csv'), year: 2023 },
      { path: path.join(process.cwd(), 'csvfiles/cuttoff2024.csv'), year: 2024 },
    ];
    
    let allRecords: CutoffRecord[] = [];
    for (const file of csvFiles) {
      if (fs.existsSync(file.path)) {
        const records = parseCSVFile(file.path, file.year);
        allRecords = allRecords.concat(records);
      }
    }
    
    // Group by college and branch
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
    
    let updatedCount = 0;
    
    for (const [collegeCode, branchesData] of Array.from(groupedData.entries())) {
      const college = await College.findOne({ code: collegeCode });
      if (!college) continue;
      
      for (const [branchName, records] of Array.from(branchesData.entries())) {
        const branch = college.branchesOffered.find((b: any) => 
          b.name.toLowerCase().includes(branchName.toLowerCase().substring(0, 15)) ||
          branchName.toLowerCase().includes(b.name.toLowerCase().substring(0, 15))
        );
        
        if (!branch) continue;
        
        // Group by year
        const yearlyData = new Map<number, Map<string, number>>();
        for (const record of records) {
          if (!yearlyData.has(record.year)) {
            yearlyData.set(record.year, new Map());
          }
          yearlyData.get(record.year)!.set(record.category, record.rank);
        }
        
        // Create historical data
        branch.historicalData = Array.from(yearlyData.entries()).map(([year, cutoffMap]) => ({
          year,
          cutoff: Object.fromEntries(cutoffMap)
        }));
      }
      
      await college.save();
      updatedCount++;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Historical data imported successfully',
      totalRecords: allRecords.length,
      updatedColleges: updatedCount
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
