# KCET Training Data Exports

## Overview

This directory contains exported training data in CSV format for KCET college admissions predictions.

## Latest Export

**File:** `kcet-training-data-2025-12-17.csv`

### Statistics
- **Total Records:** 7,612 cutoff entries
- **Colleges:** 59 engineering colleges
- **Years Covered:** 2024 (current data)
- **Categories:** 22 KCET categories (GM, 1G, 1K, 1R, 2AG, 2AK, 2AR, 2BG, 2BK, 2BR, 3AG, 3AK, 3AR, 3BG, 3BK, 3BR, SCG, SCK, SCR, STG, STK, STR)
- **Branches:** 45+ engineering branches

### Top Branches by Records
1. Civil Engineering - 1,100 records
2. Computer Science and Engineering (CSE) - 990 records
3. Artificial Intelligence & Machine Learning (AIML) - 770 records
4. Electronics and Communication Engineering (ECE) - 770 records
5. Mechanical Engineering - 726 records
6. Electrical and Electronics Engineering (EEE) - 462 records
7. Information Science and Engineering (ISE) - 220 records
8. Chemical Engineering - 176 records
9. Biotechnology - 154 records

## CSV Format

### Columns

| Column | Description | Example |
|--------|-------------|---------|
| College Code | Unique identifier for college | E001 or MongoDB ObjectId |
| College Name | Full name of the college | "R. V. College of Engineering" |
| College Type | Government/Private/Autonomous | "Private" |
| Location | College location | "Karnataka, India" |
| Branch | Engineering branch name | "Computer Science and Engineering" |
| Category | KCET category | "GM", "2AG", "SCG", etc. |
| Year | Academic year | 2022, 2023, 2024 |
| Rank | Cutoff rank for admission | 823 |
| Round | Counseling round | "FIRST", "SECOND" |
| Data Source | Origin of data | "historical" or "current" |

### Sample Data

```csv
College Code,College Name,College Type,Location,Branch,Category,Year,Rank,Round,Data Source
"E005","R. V. College of Engineering","Private","Karnataka, India","Computer Science and Engineering","GM",2024,823,"FIRST","current"
"E005","R. V. College of Engineering","Private","Karnataka, India","Computer Science and Engineering","2AG",2024,1250,"FIRST","current"
```

## Usage

### Import into Excel/Google Sheets
1. Open Excel or Google Sheets
2. File → Import → CSV
3. Select the CSV file
4. Choose comma as delimiter
5. Data will be imported with proper columns

### Import into Python/Pandas
```python
import pandas as pd

# Read CSV
df = pd.read_csv('kcet-training-data-2025-12-17.csv')

# View first few rows
print(df.head())

# Filter by category
gm_data = df[df['Category'] == 'GM']

# Filter by branch
cs_data = df[df['Branch'].str.contains('Computer Science')]

# Group by year
yearly_stats = df.groupby('Year')['Rank'].mean()
```

### Import into R
```r
# Read CSV
data <- read.csv('kcet-training-data-2025-12-17.csv')

# View structure
str(data)

# Filter by college
uvce_data <- subset(data, grepl("Visvesvaraya", College.Name))

# Summary statistics
summary(data$Rank)
```

### Import into SQL Database
```sql
-- Create table
CREATE TABLE kcet_cutoffs (
    college_code VARCHAR(50),
    college_name VARCHAR(255),
    college_type VARCHAR(50),
    location VARCHAR(100),
    branch VARCHAR(255),
    category VARCHAR(10),
    year INT,
    rank INT,
    round VARCHAR(20),
    data_source VARCHAR(20)
);

-- Import CSV (MySQL)
LOAD DATA INFILE 'kcet-training-data-2025-12-17.csv'
INTO TABLE kcet_cutoffs
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
```

## Data Analysis Examples

### 1. Find Top Colleges by Cutoff Rank
```python
# Lowest rank = most competitive
top_colleges = df[df['Category'] == 'GM'].groupby('College Name')['Rank'].min().sort_values().head(10)
print(top_colleges)
```

### 2. Analyze Branch Trends
```python
# Average cutoff by branch
branch_avg = df.groupby('Branch')['Rank'].mean().sort_values()
print(branch_avg)
```

### 3. Category-wise Analysis
```python
# Compare cutoffs across categories
category_stats = df.groupby('Category')['Rank'].agg(['mean', 'min', 'max'])
print(category_stats)
```

### 4. College Type Comparison
```python
# Government vs Private colleges
type_comparison = df.groupby(['College Type', 'Category'])['Rank'].mean()
print(type_comparison)
```

## Regenerating the Export

To regenerate the CSV with latest data:

```bash
# Run export script
npx tsx scripts/export-training-data-csv.ts

# Or with npm
npm run export:training-data
```

## Data Quality

### Validation Checks
- ✅ All ranks are positive integers
- ✅ Years are valid (2022-2024)
- ✅ Categories match KCET standards
- ✅ No duplicate entries (same college-branch-category-year)
- ✅ College names are consistent

### Known Limitations
- Currently only 2024 data is available
- Historical data (2022-2023) needs to be imported
- Some colleges may have incomplete category data
- College codes may be MongoDB ObjectIds instead of official codes

## Adding Historical Data

To include 2022-2023 data:

1. Import historical data:
```bash
npx tsx scripts/integrate-2022-data.ts
```

2. Re-export CSV:
```bash
npx tsx scripts/export-training-data-csv.ts
```

3. New CSV will include all years

## File Naming Convention

Format: `kcet-training-data-YYYY-MM-DD.csv`

Example: `kcet-training-data-2025-12-17.csv`

## Support

For issues or questions:
1. Check [Training Documentation](../../docs/TRAINING_2022_DATA.md)
2. Review [Prediction System Guide](../../docs/PREDICTION_SYSTEM_COMPLETE.md)
3. See [Import Guide](../../scripts/IMPORT_GUIDE.md)

## License

This data is for educational and research purposes only. Please respect college admission policies and guidelines.
