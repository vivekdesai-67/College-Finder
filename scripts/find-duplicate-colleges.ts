import connectDB from '../lib/mongodb';
import College from '../lib/models/College';

async function findDuplicates() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const colleges = await College.find({});
    console.log(`Total colleges: ${colleges.length}\n`);

    // Group by normalized name
    const nameMap = new Map<string, any[]>();
    
    for (const college of colleges) {
      const normalizedName = college.name
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[()]/g, '')
        .trim();
      
      if (!nameMap.has(normalizedName)) {
        nameMap.set(normalizedName, []);
      }
      nameMap.get(normalizedName)!.push(college);
    }

    // Find duplicates
    const duplicates = Array.from(nameMap.entries())
      .filter(([_, colleges]) => colleges.length > 1);

    if (duplicates.length === 0) {
      console.log('No duplicate colleges found!');
      process.exit(0);
    }

    console.log(`Found ${duplicates.length} duplicate college groups:\n`);

    for (const [normalizedName, colleges] of duplicates) {
      console.log(`"${colleges[0].name}" appears ${colleges.length} times:`);
      colleges.forEach((c, i) => {
        console.log(`  ${i + 1}. ID: ${c._id}`);
        console.log(`     Name: ${c.name}`);
        console.log(`     Fees: ₹${c.fees}`);
        console.log(`     Established: ${c.established || 'N/A'}`);
        console.log(`     Branches: ${c.branchesOffered.length}`);
        console.log(`     Code: ${c.code || 'N/A'}`);
        console.log();
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findDuplicates();
