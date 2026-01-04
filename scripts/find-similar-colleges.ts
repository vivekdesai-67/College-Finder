import connectDB from '../lib/mongodb';
import College from '../lib/models/College';

// Normalize college name for comparison
function normalizeCollegeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses content
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')
    .trim();
}

async function findSimilarColleges() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const colleges = await College.find({});
    console.log(`Total colleges: ${colleges.length}\n`);

    // Group by normalized name
    const nameMap = new Map<string, any[]>();
    
    for (const college of colleges) {
      const normalizedName = normalizeCollegeName(college.name);
      
      if (!nameMap.has(normalizedName)) {
        nameMap.set(normalizedName, []);
      }
      nameMap.get(normalizedName)!.push(college);
    }

    // Find similar colleges
    const similar = Array.from(nameMap.entries())
      .filter(([_, colleges]) => colleges.length > 1);

    if (similar.length === 0) {
      console.log('No similar colleges found!');
      process.exit(0);
    }

    console.log(`Found ${similar.length} groups of similar colleges:\n`);

    for (const [normalizedName, colleges] of similar) {
      console.log(`"${normalizedName}" has ${colleges.length} variations:`);
      colleges.forEach((c, i) => {
        console.log(`  ${i + 1}. "${c.name}"`);
        console.log(`     ID: ${c._id}`);
        console.log(`     Type: ${c.type}`);
        console.log(`     Fees: ₹${c.fees}`);
        console.log(`     Established: ${c.established || 'N/A'}`);
        console.log(`     Rating: ${c.infraRating || 'N/A'}`);
        console.log(`     Branches: ${c.branchesOffered.length}`);
        console.log(`     Code: ${c.code || 'N/A'}`);
        console.log();
      });
      console.log('---\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findSimilarColleges();
