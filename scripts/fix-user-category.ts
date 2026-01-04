import connectDB from "../lib/mongodb";
import Student from "../lib/models/Student";

async function fixUserCategory() {
  await connectDB();

  console.log('🔧 Checking for users with invalid categories...\n');

  // Find users with invalid categories
  const validCategories = [
    '1G', '1K', '1R', '2AG', '2AK', '2AR', '2BG', '2BK', '2BR',
    '3AG', '3AK', '3AR', '3BG', '3BK', '3BR', 'GM', 'GMK', 'GMR',
    'SCG', 'SCK', 'SCR', 'STG', 'STK', 'STR'
  ];

  const allUsers = await Student.find({}).lean();
  
  console.log(`Found ${allUsers.length} users\n`);

  for (const user of allUsers) {
    if (!validCategories.includes(user.category)) {
      console.log(`❌ Invalid category found:`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Current category: ${user.category}`);
      console.log(`   Rank: ${user.rank}`);
      
      // Try to fix common mistakes
      let newCategory = user.category;
      if (user.category === '2AB') newCategory = '2AG';
      if (user.category === 'general') newCategory = 'GM';
      if (user.category === 'obc') newCategory = '2AG';
      if (user.category === 'sc') newCategory = 'SCG';
      if (user.category === 'st') newCategory = 'STG';
      
      if (newCategory !== user.category) {
        await Student.updateOne(
          { _id: user._id },
          { $set: { category: newCategory } }
        );
        console.log(`   ✅ Fixed to: ${newCategory}\n`);
      } else {
        console.log(`   ⚠️  No automatic fix available. Please update manually.\n`);
      }
    }
  }

  console.log('✅ Category check complete!');
  console.log('\nValid categories are:');
  console.log(validCategories.join(', '));

  process.exit(0);
}

fixUserCategory();
