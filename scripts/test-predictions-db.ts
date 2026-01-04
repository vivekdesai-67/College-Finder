import connectDB from "../lib/mongodb";
import Prediction from "../lib/models/Prediction";

async function test() {
  await connectDB();

  const total = await Prediction.countDocuments();
  console.log('Total predictions:', total);

  const sample: any = await Prediction.findOne({ category: '1K' }).lean();
  console.log('\nSample prediction:');
  console.log('  College:', sample?.college);
  console.log('  Branch:', sample?.branch);
  console.log('  Category:', sample?.category);

  const csCount = await Prediction.countDocuments({ 
    category: '1K', 
    branch: /Computer Science/i 
  });
  console.log('\nComputer Science predictions for 1K:', csCount);

  // Test the exact query the API uses
  const query = { category: '1K' };
  const predictions = await Prediction.find(query).lean();
  console.log('\nPredictions for category 1K:', predictions.length);

  if (predictions.length > 0) {
    console.log('\nFirst 3 predictions:');
    predictions.slice(0, 3).forEach((p: any) => {
      console.log(`  - ${p.college} | ${p.branch} | ${p.category}`);
    });
  }

  process.exit(0);
}

test();
