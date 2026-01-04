# Scripts Directory

This directory contains data import and utility scripts for the KCET College Finder application.

## 📁 Files

### Import Scripts

#### `batch-import-kcet.ts`
**Main import script** - Processes all 229 KCET CSV files and imports them into MongoDB.

**Usage:**
```bash
npm run import-kcet ./kcet-data
```

**Features:**
- Parses all CSV files in a directory
- Extracts college and branch information
- Generates 5 years of historical data (2020-2024)
- Estimates placement rates, salaries, and industry growth
- Upserts to MongoDB (updates existing, creates new)
- Shows progress and statistics

**Output:**
- ~250 colleges imported
- ~1500 branches created
- Historical data for ML training
- Ready-to-use prediction system

---

#### `import-kcet-data.ts`
**Single file import** - Alternative script for importing one CSV file at a time.

**Usage:**
```bash
ts-node --project tsconfig.seed.json scripts/import-kcet-data.ts ./data/file.csv
```

**Use when:**
- Testing with a single file
- Debugging specific college data
- Incremental imports

---

#### `test-csv-parser.ts`
**Test parser** - Verifies CSV format without database connection.

**Usage:**
```bash
npm run test-parser ./kcet-data/17659916946742112_1.csv
```

**Features:**
- Parses CSV without MongoDB
- Shows detailed parsing results
- Identifies parsing issues
- Displays college and branch counts
- No database required

**Output:**
```
🏫 Found college:
   Code: 1E002
   Name: RV College of Engineering
   Location: Bangalore
   Type: Private
   📚 Branch: CS - Computer Science
      Cutoffs: GM:250, 2AG:700, 2AR:900...

📊 Summary:
   Total colleges parsed: 7
   Total branches: 30
```

---

### Documentation

#### `IMPORT_GUIDE.md`
Comprehensive guide covering:
- CSV format details
- Setup instructions
- Troubleshooting
- Data quality checks
- Verification steps

#### `README.md` (this file)
Quick reference for all scripts in this directory.

---

## 🚀 Quick Start

### 1. Prepare Your Data
```bash
mkdir kcet-data
# Copy 229 CSV files to kcet-data/
```

### 2. Test Parser (Optional)
```bash
npm run test-parser ./kcet-data/17659916946742112_1.csv
```

### 3. Import All Data
```bash
npm run import-kcet ./kcet-data
```

---

## 📊 CSV Format Expected

```
<CollegeCode><CollegeName><Location>
<BranchCode> <BranchName> <Cutoff1> <Cutoff2> ... <CutoffN>
<BranchCode> <BranchName> <Cutoff1> <Cutoff2> ... <CutoffN>

<CollegeCode><CollegeName><Location>
<BranchCode> <BranchName> <Cutoff1> <Cutoff2> ... <CutoffN>
```

**Example:**
```
1E001University of Visvesvaraya College of EngineeringBangalore
AI Artificial Intelligence 500 1200 1500 2000 2500 3000 3500 4000 4500
CS Computer Science 450 1100 1400 1900 2400 2900 3400 3900 4400
```

**Cutoff Categories (in order):**
1. GM - General Merit
2. 2AG - Category 2A General
3. 2AR - Category 2A Rural
4. 2BG - Category 2B General
5. 2BR - Category 2B Rural
6. 3AG - Category 3A General
7. 3AR - Category 3A Rural
8. 3BG - Category 3B General
9. 3BR - Category 3B Rural
10. SCG - Scheduled Caste General
11. SCR - Scheduled Caste Rural
12. STG - Scheduled Tribe General
13. STR - Scheduled Tribe Rural

---

## 🔧 How It Works

### 1. CSV Parsing
```
CSV File → Parser → College Data
```
- Reads CSV line by line
- Identifies college headers (starts with code like "1E001")
- Extracts branch lines (starts with branch code like "CS")
- Maps cutoff numbers to categories

### 2. Data Enhancement
```
Basic Data → Estimation Engine → Enhanced Data
```
- Estimates placement rates (based on college type & branch)
- Calculates average salaries (based on reputation)
- Determines industry growth (based on domain)
- Assigns college types (Government/Private/Autonomous)

### 3. Historical Generation
```
Current Data → ML Generator → 5 Years of History
```
- Generates 2020-2024 data
- Applies realistic trends
- CS/AI: Increasing demand (cutoffs decreasing)
- ME/Civil: Stable trends
- Adds randomness for realism

### 4. Database Import
```
Enhanced Data → MongoDB → Ready for ML
```
- Upserts colleges (update or create)
- Merges duplicate entries
- Stores complete historical data
- Indexes for fast queries

---

## 📈 Data Generated

### For Each Branch:

#### Current Data (2024)
```javascript
{
  name: "Computer Science",
  cutoff: { GM: 250, "2AG": 700, ... },
  placementRate: 0.95,
  avgSalary: 850000,
  maxSalary: 2125000,
  industryGrowth: 0.85,
  admissionTrend: 0.7
}
```

#### Historical Data (2020-2024)
```javascript
historicalData: [
  {
    year: 2020,
    cutoff: { GM: 290, "2AG": 810, ... },
    placementRate: 0.89,
    avgSalary: 650000,
    studentsAdmitted: 68,
    studentsPlaced: 60
  },
  // ... 2021, 2022, 2023, 2024
]
```

---

## 🎯 Estimation Logic

### Placement Rates
```javascript
Base Rate:
- Top colleges (RV, Ramaiah, BMS, PES): 90%
- Government colleges: 75%
- Private colleges: 65%

Bonus:
- CS/AI branches: +10%

Final: Min(95%, baseRate + bonus)
```

### Salaries
```javascript
Base Salary:
- Top colleges: ₹8 LPA
- Private colleges: ₹4.5 LPA

Bonus:
- CS/AI branches: +₹2 LPA

Max Salary: avgSalary × 2.5
```

### Industry Growth
```javascript
- AI/ML/Data Science: 95%
- CS/IT/Cyber Security: 85%
- EC/EE: 70%
- ME/Civil: 55%
- Others: 60%
```

---

## 🔍 Verification

### Check Import Success
```bash
# MongoDB
mongosh
> use college-finder
> db.colleges.countDocuments()
> db.colleges.findOne()

# API
curl http://localhost:3000/api/predictions

# Frontend
# Visit: http://localhost:3000/predictions
```

### Expected Results
- ~250 colleges in database
- Each college has multiple branches
- Each branch has 5 years of historical data
- Predictions API returns data
- Frontend displays predictions

---

## 🆘 Troubleshooting

### Issue: "No CSV files found"
```bash
# Check directory
ls -la ./kcet-data/*.csv | wc -l

# Use absolute path
npm run import-kcet /full/path/to/kcet-data
```

### Issue: "MongoDB connection failed"
```bash
# Check .env.local
cat .env.local | grep MONGODB_URI

# Test connection
mongosh $MONGODB_URI
```

### Issue: "Parsing errors"
```bash
# Test single file
npm run test-parser ./kcet-data/file.csv

# Check encoding
file ./kcet-data/file.csv
# Should be: UTF-8 Unicode text
```

### Issue: "Wrong data imported"
```bash
# Clear database
mongosh
> use college-finder
> db.colleges.deleteMany({})

# Re-import
npm run import-kcet ./kcet-data
```

---

## 📚 Additional Resources

- **Quick Start**: See `../QUICK_START.md`
- **Detailed Guide**: See `IMPORT_GUIDE.md`
- **Import Flow**: See `../IMPORT_FLOW.md`
- **Checklist**: See `../IMPORT_CHECKLIST.md`
- **Status**: See `../IMPORT_STATUS.md`

---

## 🎉 Success!

When import completes successfully:
- ✅ Real KCET 2024 data imported
- ✅ 5 years of historical trends generated
- ✅ ML model trained and ready
- ✅ Predictions available with confidence scores
- ✅ System ready for production

---

**Need help?** Check the documentation files or run the test parser first!
