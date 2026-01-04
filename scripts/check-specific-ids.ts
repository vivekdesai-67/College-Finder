import connectDB from '../lib/mongodb';
import mongoose from 'mongoose';

async function checkIds() {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection not established');
      process.exit(1);
    }
    
    const collection = db.collection('colleges');
    
    const id1 = '6943fd67e6599f20e3cbe480';
    const id2 = '6943fd67e6599f20e3cbe4f7';
    
    console.log('Checking for specific IDs...\n');
    
    const college1 = await collection.findOne({ _id: new mongoose.Types.ObjectId(id1) });
    const college2 = await collection.findOne({ _id: new mongoose.Types.ObjectId(id2) });
    
    if (college1) {
      console.log(`✓ Found college with ID ${id1}:`);
      console.log(`  Name: ${college1.name}`);
      console.log(`  Fees: ₹${college1.fees}`);
      console.log(`  Established: ${college1.established}`);
      console.log();
    } else {
      console.log(`✗ No college found with ID ${id1}`);
    }
    
    if (college2) {
      console.log(`✓ Found college with ID ${id2}:`);
      console.log(`  Name: ${college2.name}`);
      console.log(`  Fees: ₹${college2.fees}`);
      console.log(`  Established: ${college2.established}`);
      console.log();
    } else {
      console.log(`✗ No college found with ID ${id2}`);
    }
    
    // Count all Sangha colleges
    const sanghaCount = await collection.countDocuments({
      name: { $regex: /sangha/i }
    });
    
    console.log(`Total Sangha colleges in database: ${sanghaCount}`);
    
    // List all Sangha colleges
    const allSangha = await collection.find({
      name: { $regex: /sangha/i }
    }).toArray();
    
    console.log('\nAll Sangha colleges:');
    allSangha.forEach((c, i) => {
      console.log(`${i + 1}. _id: ${c._id}, Fees: ₹${c.fees}, Est: ${c.established}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkIds();
