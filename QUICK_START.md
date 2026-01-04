# 🚀 Quick Start - KCET Data Import

## 3 Simple Steps to Import Real Data

### 📁 Step 1: Prepare Files (1 minute)
```bash
mkdir kcet-data
# Move your 229 CSV files into kcet-data/
```

### 🧪 Step 2: Test (Optional - 30 seconds)
```bash
npm run test-parser ./kcet-data/17659916946742112_1.csv
```

### 🎯 Step 3: Import (5-10 minutes)
```bash
npm run import-kcet ./kcet-data
```

## ✅ Done!

Your ML model is now trained with:
- ✅ Real KCET 2024 cutoff data
- ✅ 5 years of historical trends (2020-2024)
- ✅ ~250 colleges
- ✅ ~1500 branches
- ✅ Ready for predictions!

## 🔍 Verify

```bash
# Check data
mongosh
> use college-finder
> db.colleges.countDocuments()

# Test API
curl http://localhost:3000/api/predictions

# View predictions
# Visit: http://localhost:3000/predictions
```

## 📊 Expected CSV Format

```
1E001University of Visvesvaraya College of EngineeringBangalore
AI Artificial Intelligence 500 1200 1500 2000 2500
CS Computer Science 450 1100 1400 1900 2400
```

## 🆘 Need Help?

- **Detailed Guide**: See `KCET_DATA_IMPORT.md`
- **Full Documentation**: See `scripts/IMPORT_GUIDE.md`
- **Status & Next Steps**: See `IMPORT_STATUS.md`

## 🎉 That's It!

Simple, fast, and ready to go!
