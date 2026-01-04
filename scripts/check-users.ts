import connectDB from "../lib/mongodb";
import Student from "../lib/models/Student";
import Admin from "../lib/models/Admin";

async function checkUsers() {
  await connectDB();

  console.log('🔍 Checking Users in Database\n');

  // Check students
  const students = await Student.find({}).lean();
  console.log(`👥 Students: ${students.length}`);
  if (students.length > 0) {
    console.log('\nFirst 3 students:');
    students.slice(0, 3).forEach((s: any) => {
      console.log(`  - Username: ${s.username}`);
      console.log(`    Email: ${s.email || 'N/A'}`);
      console.log(`    Profile Complete: ${s.profileComplete || false}`);
    });
  }

  // Check admins
  const admins = await Admin.find({}).lean();
  console.log(`\n👑 Admins: ${admins.length}`);
  if (admins.length > 0) {
    console.log('\nFirst 3 admins:');
    admins.slice(0, 3).forEach((a: any) => {
      console.log(`  - Username: ${a.username}`);
      console.log(`    Email: ${a.email || 'N/A'}`);
    });
  }

  if (students.length === 0 && admins.length === 0) {
    console.log('\n⚠️  No users found in database!');
    console.log('You need to register a new account.');
  }

  process.exit(0);
}

checkUsers();
