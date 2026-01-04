import connectDB from '../lib/mongodb';
import College from '../lib/models/College';

async function checkCollege() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Find Bahubali College
    const college = await College.findOne({ 
      name: { $regex: /bahubali/i } 
    });

    if (!college) {
      console.log('College not found');
      process.exit(1);
    }

    console.log(`\nCollege: ${college.name}`);
    console.log(`Total branches: ${college.branchesOffered.length}\n`);

    college.branchesOffered.forEach((branch, index) => {
      console.log(`${index + 1}. "${branch.name}"`);
      const cutoffObj = branch.cutoff instanceof Map 
        ? Object.fromEntries(branch.cutoff)
        : branch.cutoff;
      
      // Show a few key categories
      console.log(`   2AG: ${cutoffObj['2AG']}, GM: ${cutoffObj['GM']}, 1G: ${cutoffObj['1G']}`);
      console.log();
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCollege();
