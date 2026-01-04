import connectDB from '../lib/mongodb';
import mongoose from 'mongoose';

async function cleanDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection not established');
      process.exit(1);
    }
    
    const collection = db.collection('colleges');
    
    // Get all colleges
    const allColleges = await collection.find({}).toArray();
    console.log(`Total colleges in database: ${allColleges.length}`);
    
    // Group by name (exact match)
    const nameMap = new Map<string, any[]>();
    
    allColleges.forEach(college => {
      const name = college.name;
      if (!nameMap.has(name)) {
        nameMap.set(name, []);
      }
      nameMap.get(name)!.push(college);
    });
    
    // Find duplicates
    const duplicates = Array.from(nameMap.entries())
      .filter(([_, colleges]) => colleges.length > 1);
    
    if (duplicates.length === 0) {
      console.log('✓ No duplicate colleges found');
      process.exit(0);
    }
    
    console.log(`\nFound ${duplicates.length} colleges with duplicates:\n`);
    
    let totalRemoved = 0;
    
    for (const [name, colleges] of duplicates) {
      console.log(`"${name}" has ${colleges.length} entries:`);
      colleges.forEach((c, i) => {
        console.log(`  ${i + 1}. _id: ${c._id}, Fees: ₹${c.fees}, Est: ${c.established}, Branches: ${c.branchesOffered?.length || 0}`);
      });
      
      // Keep the one with most branches
      const bestCollege = colleges.sort((a, b) => 
        (b.branchesOffered?.length || 0) - (a.branchesOffered?.length || 0)
      )[0];
      
      console.log(`  → Keeping: _id ${bestCollege._id} (${bestCollege.branchesOffered?.length || 0} branches)`);
      
      // Delete the others
      const idsToDelete = colleges
        .filter(c => c._id.toString() !== bestCollege._id.toString())
        .map(c => c._id);
      
      if (idsToDelete.length > 0) {
        const result = await collection.deleteMany({
          _id: { $in: idsToDelete }
        });
        console.log(`  ✓ Deleted ${result.deletedCount} duplicates\n`);
        totalRemoved += result.deletedCount;
      }
    }
    
    console.log(`\n✅ Cleanup complete!`);
    console.log(`Total duplicates removed: ${totalRemoved}`);
    console.log(`Remaining colleges: ${allColleges.length - totalRemoved}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanDatabase();
