import connectDB from '../lib/mongodb';
import College from '../lib/models/College';

async function verify() {
  try {
    await connectDB();
    
    const count = await College.countDocuments();
    console.log(`\n📊 Total Colleges: ${count}\n`);
    
    const colleges = await College.find().select('code name location type').limit(10).lean();
    
    console.log('📋 First 10 Colleges:');
    console.log('─'.repeat(80));
    colleges.forEach((college: any, index) => {
      console.log(`${index + 1}. [${college.code || 'N/A'}] ${college.name}`);
      console.log(`   📍 ${college.location}`);
      console.log(`   🏛️  ${college.type}`);
      console.log('');
    });
    
    // Check a specific college with branches
    const sampleCollege = await College.findOne({ code: 'E001' }).lean();
    if (sampleCollege) {
      console.log('\n🔍 Detailed View - E001:');
      console.log('─'.repeat(80));
      console.log(`Name: ${sampleCollege.name}`);
      console.log(`Location: ${sampleCollege.location}`);
      console.log(`Type: ${sampleCollege.type}`);
      console.log(`Branches: ${sampleCollege.branchesOffered.length}`);
      console.log('\nSample Branches:');
      sampleCollege.branchesOffered.slice(0, 3).forEach((branch: any) => {
        console.log(`  • ${branch.name}`);
        const cutoffKeys = Object.keys(branch.cutoff);
        console.log(`    Cutoff categories: ${cutoffKeys.length} (${cutoffKeys.slice(0, 5).join(', ')}...)`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verify();
