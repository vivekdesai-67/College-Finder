import connectDB from '../lib/mongodb';
import College from '../lib/models/College';

async function checkSangha() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Find all colleges with "sangha" in the name
    const colleges = await College.find({ 
      name: { $regex: /sangha/i } 
    });

    console.log(`Found ${colleges.length} colleges with "sangha" in name:\n`);

    colleges.forEach((college, i) => {
      console.log(`${i + 1}. ${college.name}`);
      console.log(`   ID: ${college._id}`);
      console.log(`   Code: ${college.code || 'N/A'}`);
      console.log(`   Fees: ₹${college.fees}`);
      console.log(`   Established: ${college.established || 'N/A'}`);
      console.log(`   Type: ${college.type}`);
      console.log(`   Branches: ${college.branchesOffered.length}`);
      console.log();
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSangha();
