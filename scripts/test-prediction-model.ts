import connectDB from "../lib/mongodb";
import Prediction from "../lib/models/Prediction";

async function test() {
  await connectDB();

  console.log('Testing Prediction model...\n');

  // Test 1: Count all predictions
  const total = await Prediction.countDocuments();
  console.log(`✅ Total predictions: ${total}`);

  // Test 2: Find by category
  const category1K = await Prediction.find({ category: '1K' }).lean();
  console.log(`✅ Predictions for category 1K: ${category1K.length}`);

  // Test 3: Check collection name
  console.log(`✅ Collection name: ${Prediction.collection.name}`);

  // Test 4: Get one sample
  const sample: any = await Prediction.findOne({}).lean();
  if (sample) {
    console.log('\n✅ Sample prediction:');
    console.log(`   College: ${sample.college}`);
    console.log(`   Branch: ${sample.branch}`);
    console.log(`   Category: ${sample.category}`);
    console.log(`   2025: ${sample.predictedCutoff2025}`);
    console.log(`   2026: ${sample.predictedCutoff2026}`);
  }

  // Test 5: Check if model is properly registered
  const mongoose = require('mongoose');
  console.log('\n✅ Registered models:', Object.keys(mongoose.models));

  process.exit(0);
}

test();
