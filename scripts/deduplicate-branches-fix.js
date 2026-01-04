// Function to normalize branch names for comparison
function normalizeBranchName(name) {
  return name
    .toLowerCase()
    .replace(/\s+&\s+/g, ' and ')
    .replace(/\s+/g, ' ')
    .replace(/[()]/g, '')
    .trim();
}

// Connect to database
const db = db.getSiblingDB('college-finder');

// Get all colleges
const colleges = db.colleges.find({}).toArray();
let updatedCount = 0;

colleges.forEach(function(college) {
  if (!college.branchesOffered || college.branchesOffered.length === 0) return;
  
  const seen = new Map();
  const uniqueBranches = [];
  
  college.branchesOffered.forEach(function(branch) {
    const normalized = normalizeBranchName(branch.name);
    
    if (!seen.has(normalized)) {
      seen.set(normalized, true);
      uniqueBranches.push(branch);
    }
  });
  
  // Only update if we removed duplicates
  if (uniqueBranches.length < college.branchesOffered.length) {
    db.colleges.updateOne(
      { _id: college._id },
      { $set: { branchesOffered: uniqueBranches } }
    );
    updatedCount++;
    print('Updated ' + college.name + ': ' + college.branchesOffered.length + ' -> ' + uniqueBranches.length + ' branches');
  }
});

print('\nTotal colleges updated: ' + updatedCount);
