import connectDB from '../lib/mongodb';
import College from '../lib/models/College';

async function testQuery() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Same query as the API
    const colleges = await College.find({}).sort({ name: 1 });
    
    console.log(`Query returned ${colleges.length} colleges`);
    
    // Check for duplicates by _id
    const ids = colleges.map(c => c._id.toString());
    const uniqueIds = new Set(ids);
    
    console.log(`Unique IDs: ${uniqueIds.size}`);
    
    if (ids.length !== uniqueIds.size) {
      console.log('\n⚠️  DUPLICATES FOUND!');
      
      // Find which IDs are duplicated
      const idCounts = new Map<string, number>();
      ids.forEach(id => {
        idCounts.set(id, (idCounts.get(id) || 0) + 1);
      });
      
      const duplicates = Array.from(idCounts.entries())
        .filter(([_, count]) => count > 1);
      
      console.log(`\nDuplicated IDs (${duplicates.length}):`);
      duplicates.forEach(([id, count]) => {
        const college = colleges.find(c => c._id.toString() === id);
        console.log(`  ${id} (${count}x): ${college?.name}`);
      });
    } else {
      console.log('\n✓ No duplicates by _id');
    }
    
    // Check for duplicates by name
    const names = colleges.map(c => c.name);
    const nameCounts = new Map<string, number>();
    names.forEach(name => {
      nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
    });
    
    const duplicateNames = Array.from(nameCounts.entries())
      .filter(([_, count]) => count > 1);
    
    if (duplicateNames.length > 0) {
      console.log(`\n⚠️  DUPLICATE NAMES FOUND (${duplicateNames.length}):`);
      duplicateNames.forEach(([name, count]) => {
        console.log(`  "${name}" appears ${count} times`);
        const matchingColleges = colleges.filter(c => c.name === name);
        matchingColleges.forEach((c, i) => {
          console.log(`    ${i + 1}. ID: ${c._id}, Type: ${c.type}, Fees: ${c.fees}`);
        });
      });
    } else {
      console.log('\n✓ No duplicate names');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testQuery();
