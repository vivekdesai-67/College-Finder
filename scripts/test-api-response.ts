// This script simulates what the API does
import connectDB from '../lib/mongodb';
import College from '../lib/models/College';

async function testAPIResponse() {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    // Simulate the API query
    const query: any = {};
    const sortObj: any = { name: 1 };

    console.log('Executing query...');
    const colleges = await College.find(query).sort(sortObj).lean();
    
    console.log(`MongoDB returned: ${colleges.length} colleges`);
    
    // Check for duplicates by _id
    const ids = colleges.map((c: any) => c._id.toString());
    const uniqueIds = new Set(ids);
    console.log(`Unique _id values: ${uniqueIds.size}`);
    
    if (ids.length !== uniqueIds.size) {
      console.log('\n⚠️  DUPLICATE _IDs FOUND IN MONGODB RESULT!');
      const idCounts = new Map<string, number>();
      ids.forEach(id => {
        idCounts.set(id, (idCounts.get(id) || 0) + 1);
      });
      
      const duplicates = Array.from(idCounts.entries())
        .filter(([_, count]) => count > 1);
      
      console.log(`Duplicated _ids: ${duplicates.length}`);
      duplicates.forEach(([id, count]) => {
        const college = colleges.find((c: any) => c._id.toString() === id);
        console.log(`  ${id} appears ${count} times: ${college?.name}`);
      });
    }
    
    // Deduplicate
    const uniqueColleges = Array.from(
      new Map(colleges.map((c: any) => [c._id.toString(), c])).values()
    );
    
    console.log(`After deduplication: ${uniqueColleges.length} colleges`);
    
    // Check for colleges with similar names
    console.log('\n--- Checking for similar names ---');
    const nameGroups = new Map<string, any[]>();
    
    uniqueColleges.forEach((college: any) => {
      const baseName = college.name.replace(/\s*\([^)]*\)/g, '').trim();
      if (!nameGroups.has(baseName)) {
        nameGroups.set(baseName, []);
      }
      nameGroups.get(baseName)!.push(college);
    });
    
    const similarNames = Array.from(nameGroups.entries())
      .filter(([_, colleges]) => colleges.length > 1);
    
    if (similarNames.length > 0) {
      console.log(`\nFound ${similarNames.length} groups with similar names:`);
      similarNames.forEach(([baseName, colleges]) => {
        console.log(`\n"${baseName}" (${colleges.length} variations):`);
        colleges.forEach((c: any, i: number) => {
          console.log(`  ${i + 1}. "${c.name}"`);
          console.log(`     _id: ${c._id}`);
          console.log(`     Fees: ₹${c.fees}, Est: ${c.established}, Type: ${c.type}`);
        });
      });
    } else {
      console.log('No similar names found');
    }
    
    // Sample the JSON that would be returned
    console.log('\n--- Sample colleges that would be returned ---');
    const sanghaColleges = uniqueColleges.filter((c: any) => 
      c.name.toLowerCase().includes('sangha')
    );
    
    if (sanghaColleges.length > 0) {
      console.log(`\nSangha colleges (${sanghaColleges.length}):`);
      sanghaColleges.forEach((c: any) => {
        console.log(`  - ${c.name}`);
        console.log(`    _id: ${c._id}`);
        console.log(`    Fees: ₹${c.fees}, Est: ${c.established}`);
        console.log(`    Branches: ${c.branchesOffered?.length || 0}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAPIResponse();
