import connectDB from '../lib/mongodb';
import College from '../lib/models/College';
import Admin from '../lib/models/Admin';
import { realColleges } from '../app/api/seed/data';

const sampleColleges = realColleges.map((college: any) => {
  // Normalize type to match schema enum
  let normalizedType = college.type || 'Private';
  if (normalizedType.includes('Government')) {
    normalizedType = 'Government';
  } else if (normalizedType.includes('Autonomous')) {
    normalizedType = 'Autonomous';
  } else {
    normalizedType = 'Private';
  }

  return {
    ...college,
    type: normalizedType,
    fees: college.fees || 100000,
    infraRating: college.infraRating || 4.0,
    established: college.established || 2000,
  };
});

async function testSeed() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Create admin if doesn't exist
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new Admin({ username: 'admin', password: 'admin' });
      await admin.save();
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Clear and seed colleges
    console.log('Clearing existing colleges...');
    await College.deleteMany({});
    console.log('✅ Cleared existing colleges');

    console.log(`Inserting ${sampleColleges.length} colleges...`);
    await College.insertMany(sampleColleges);
    console.log(`✅ Successfully seeded ${sampleColleges.length} colleges`);

    // Verify
    const count = await College.countDocuments();
    console.log(`\n📊 Total colleges in database: ${count}`);

    // Show sample
    const sample = await College.findOne();
    console.log('\n📝 Sample college:');
    console.log(`   Name: ${sample?.name}`);
    console.log(`   Code: ${(sample as any)?.code}`);
    console.log(`   Branches: ${sample?.branchesOffered.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

testSeed();
