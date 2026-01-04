import connectDB from '../lib/mongodb';
import mongoose from 'mongoose';

async function rawCheck() {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    // Get the raw collection
    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection not established');
      process.exit(1);
    }
    
    const collection = db.collection('colleges');
    
    // Count total documents
    const totalCount = await collection.countDocuments();
    console.log(`Total documents in colleges collection: ${totalCount}`);
    
    // Find all Sangha colleges
    const sanghaColleges = await collection.find({
      name: { $regex: /sangha/i }
    }).toArray();
    
    console.log(`\nSangha colleges found: ${sanghaColleges.length}\n`);
    
    sanghaColleges.forEach((college, i) => {
      console.log(`${i + 1}. ${college.name}`);
      console.log(`   _id: ${college._id}`);
      console.log(`   Fees: ₹${college.fees}`);
      console.log(`   Established: ${college.established}`);
      console.log(`   Type: ${college.type}`);
      console.log(`   Rating: ${college.infraRating}`);
      console.log(`   Branches: ${college.branchesOffered?.length || 0}`);
      console.log();
    });
    
    // Check for any colleges with exact same name
    const allColleges = await collection.find({}).toArray();
    const nameMap = new Map<string, any[]>();
    
    allColleges.forEach(college => {
      const name = college.name;
      if (!nameMap.has(name)) {
        nameMap.set(name, []);
      }
      nameMap.get(name)!.push(college);
    });
    
    const duplicateNames = Array.from(nameMap.entries())
      .filter(([_, colleges]) => colleges.length > 1);
    
    if (duplicateNames.length > 0) {
      console.log(`\n⚠️  Found ${duplicateNames.length} duplicate names:\n`);
      duplicateNames.forEach(([name, colleges]) => {
        console.log(`"${name}" appears ${colleges.length} times:`);
        colleges.forEach((c, i) => {
          console.log(`  ${i + 1}. _id: ${c._id}, Fees: ₹${c.fees}, Est: ${c.established}`);
        });
        console.log();
      });
    } else {
      console.log('\n✓ No duplicate names in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

rawCheck();
