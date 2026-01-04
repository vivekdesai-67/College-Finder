import connectDB from "../lib/mongodb";
import College from "../lib/models/College";

async function test() {
  await connectDB();

  const college: any = await College.findOne({ 
    'branchesOffered.name': /Computer Science/i 
  }).lean();
  
  if (college) {
    console.log('College:', college.name);
    console.log('\nBranches:');
    college.branchesOffered?.slice(0, 10).forEach((b: any) => {
      console.log(`  - ${b.name}`);
    });
  }

  // Check all unique branch names
  const colleges: any[] = await College.find({}).lean();
  const branches = new Set<string>();
  
  colleges.forEach(c => {
    c.branchesOffered?.forEach((b: any) => {
      branches.add(b.name);
    });
  });

  console.log(`\n\nTotal unique branches in colleges: ${branches.size}`);
  console.log('\nCS-related branches:');
  Array.from(branches)
    .filter(b => b.toLowerCase().includes('computer') || b.toLowerCase().includes('cs'))
    .sort()
    .forEach(b => console.log(`  - ${b}`));

  process.exit(0);
}

test();
