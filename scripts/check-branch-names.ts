import connectDB from "../lib/mongodb";
import Prediction from "../lib/models/Prediction";

async function test() {
  await connectDB();

  // Get unique branch names for category 1K
  const predictions: any[] = await Prediction.find({ category: '1K' }).lean();
  
  const branches = new Set<string>();
  predictions.forEach(p => branches.add(p.branch));
  
  console.log(`Total unique branches for 1K: ${branches.size}\n`);
  console.log('Branch names:');
  Array.from(branches).sort().forEach(b => console.log(`  - ${b}`));

  // Check for CS-related branches
  console.log('\n\nCS-related branches:');
  Array.from(branches)
    .filter(b => b.toLowerCase().includes('computer') || b.toLowerCase().includes('cs'))
    .forEach(b => console.log(`  - ${b}`));

  process.exit(0);
}

test();
