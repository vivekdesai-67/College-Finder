import connectDB from '../lib/mongodb';
import College from '../lib/models/College';

async function listColleges() {
  try {
    await connectDB();
    const colleges = await College.find({}).select('name');
    console.log(`Found ${colleges.length} colleges:\n`);
    colleges.forEach((c, i) => {
      console.log(`${i + 1}. ${c.name}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listColleges();
