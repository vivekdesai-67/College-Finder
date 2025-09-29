import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import College from '../../../lib/models/College';
import Admin from '../../../lib/models/Admin';

const karnatakaColleges = [
  // 1
  {
    name: "R.V. College of Engineering",
    location: "Bengaluru, Karnataka",
    fees: 120000,
    infraRating: 4.8,
    type: "Private",
    established: 1963,
    accreditation: "AICTE, NBA",
    description: "Top private engineering college in Karnataka with strong placements, active research and industry ties.",
    image: "https://www.rvce.edu.in/sites/default/files/rvce-entrance.jpg",
    branchesOffered: [
      {
        name: "Computer Science Engineering",
        cutoff: { general: 250, obc: 900, sc: 2500, st: 5000 },
        placementRate: 0.96,
        avgSalary: 1200000,
        maxSalary: 4200000,
        admissionTrend: 0.95,
        industryGrowth: 0.9,
        isBooming: true
      },
      {
        name: "Electronics and Communication Engineering",
        cutoff: { general: 1500, obc: 4500, sc: 9000, st: 15000 },
        placementRate: 0.89,
        avgSalary: 950000,
        maxSalary: 3000000,
        admissionTrend: 0.8,
        industryGrowth: 0.8
      }
    ]
  },
  // 2
  {
    name: "B.M.S. College of Engineering",
    location: "Bengaluru, Karnataka",
    fees: 110000,
    infraRating: 4.5,
    type: "Private",
    established: 1946,
    accreditation: "AICTE, NBA",
    description: "Historic institution with broad course offerings and good placement records.",
    image: "https://www.bmsce.ac.in/images/bmsce-campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science & Engineering",
        cutoff: { general: 900, obc: 2000, sc: 6000, st: 12000 },
        placementRate: 0.94,
        avgSalary: 1000000,
        maxSalary: 3500000,
        admissionTrend: 0.9,
        industryGrowth: 0.85,
        isBooming: true
      },
      {
        name: "Information Science & Engineering",
        cutoff: { general: 1200, obc: 2800, sc: 8000, st: 14000 },
        placementRate: 0.90,
        avgSalary: 850000,
        maxSalary: 3000000,
        admissionTrend: 0.85,
        industryGrowth: 0.8
      }
    ]
  },
  // 3
  {
    name: "PES University (RR Campus)",
    location: "Bengaluru, Karnataka",
    fees: 300000,
    infraRating: 4.7,
    type: "Private",
    established: 1972,
    accreditation: "AICTE, NAAC, NBA",
    description: "Prestigious private university with high annual fees and strong placements for CSE and allied branches.",
    image: "https://www.pes.edu/sites/default/files/pes-campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science Engineering",
        cutoff: { general: 400, obc: 1500, sc: 8000, st: 16000 },
        placementRate: 0.94,
        avgSalary: 1150000,
        maxSalary: 4500000,
        admissionTrend: 0.93,
        industryGrowth: 0.9,
        isBooming: true
      },
      {
        name: "AI & Machine Learning",
        cutoff: { general: 900, obc: 3000, sc: 10000, st: 18000 },
        placementRate: 0.92,
        avgSalary: 1100000,
        maxSalary: 3800000,
        admissionTrend: 0.9,
        industryGrowth: 0.9,
        isBooming: true
      }
    ]
  },
  // 4
  {
    name: "M.S. Ramaiah Institute of Technology (MSRIT)",
    location: "Bengaluru, Karnataka",
    fees: 150000,
    infraRating: 4.6,
    type: "Private",
    established: 1962,
    accreditation: "AICTE, NBA",
    description: "Well-known engineering college with good research and placement stats.",
    image: "https://www.msrit.edu/sites/default/files/msrit-campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science Engineering",
        cutoff: { general: 800, obc: 2500, sc: 9000, st: 17000 },
        placementRate: 0.92,
        avgSalary: 1050000,
        maxSalary: 3600000,
        admissionTrend: 0.88,
        industryGrowth: 0.83,
        isBooming: true
      },
      {
        name: "Aerospace / Mechanical",
        cutoff: { general: 3000, obc: 9000, sc: 20000, st: 35000 },
        placementRate: 0.78,
        avgSalary: 780000,
        maxSalary: 2500000,
        admissionTrend: 0.6,
        industryGrowth: 0.65
      }
    ]
  },
  // 5
  {
    name: "Dayananda Sagar College of Engineering (DSCE)",
    location: "Bengaluru, Karnataka",
    fees: 140000,
    infraRating: 4.3,
    type: "Private",
    established: 1979,
    accreditation: "AICTE, NBA",
    description: "Large private college group with multiple campuses and active placements.",
    image: "https://www.dsce.edu.in/sites/default/files/dsce-campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science & Engineering",
        cutoff: { general: 2000, obc: 7000, sc: 18000, st: 35000 },
        placementRate: 0.88,
        avgSalary: 900000,
        maxSalary: 3000000,
        admissionTrend: 0.8,
        industryGrowth: 0.78
      },
      {
        name: "Electronics and Communication",
        cutoff: { general: 4000, obc: 12000, sc: 28000, st: 45000 },
        placementRate: 0.82,
        avgSalary: 750000,
        maxSalary: 2400000,
        admissionTrend: 0.7,
        industryGrowth: 0.7
      }
    ]
  },
  // 6
  {
    name: "National Institute of Technology Karnataka (NITK), Surathkal",
    location: "Surathkal (Mangaluru), Karnataka",
    fees: 60000,
    infraRating: 4.9,
    type: "Government",
    established: 1960,
    accreditation: "UGC, AICTE",
    description: "Top national institute (NIT) in Karnataka — extremely competitive JEE cutoffs and excellent placements.",
    image: "https://www.nitk.ac.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science & Engineering",
        cutoff: { general: 300, obc: 1200, sc: 8000, st: 20000 },
        placementRate: 0.98,
        avgSalary: 1400000,
        maxSalary: 8000000,
        admissionTrend: 0.98,
        industryGrowth: 0.95,
        isBooming: true
      },
      {
        name: "Electronics & Communication",
        cutoff: { general: 1200, obc: 5000, sc: 20000, st: 40000 },
        placementRate: 0.93,
        avgSalary: 950000,
        maxSalary: 4000000,
        admissionTrend: 0.9,
        industryGrowth: 0.88
      }
    ]
  },
  // 7
  {
    name: "Manipal Institute of Technology (MIT), Manipal",
    location: "Manipal, Karnataka",
    fees: 250000,
    infraRating: 4.7,
    type: "Private",
    established: 1957,
    accreditation: "AICTE, NAAC",
    description: "Highly reputed national-level institute under MAHE with good placements and international exposure.",
    image: "https://www.manipal.edu/skin/images/mit-campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science & Engineering",
        cutoff: { general: 5000, obc: 15000, sc: 50000, st: 120000 },
        placementRate: 0.92,
        avgSalary: 1000000,
        maxSalary: 4500000,
        admissionTrend: 0.9,
        industryGrowth: 0.85
      },
      {
        name: "Information Technology",
        cutoff: { general: 8000, obc: 25000, sc: 80000, st: 180000 },
        placementRate: 0.88,
        avgSalary: 820000,
        maxSalary: 3000000,
        admissionTrend: 0.8,
        industryGrowth: 0.78
      }
    ]
  },
  // 8
  {
    name: "University Visvesvaraya College of Engineering (UVCE)",
    location: "Bengaluru, Karnataka",
    fees: 48000,
    infraRating: 4.2,
    type: "Government",
    established: 1917,
    accreditation: "AICTE, UGC",
    description: "Historic government engineering college under Bengaluru University with strong core branches.",
    image: "https://upload.wikimedia.org/wikipedia/commons/uvce.jpg",
    branchesOffered: [
      {
        name: "Civil Engineering",
        cutoff: { general: 1800, obc: 5000, sc: 15000, st: 30000 },
        placementRate: 0.85,
        avgSalary: 700000,
        maxSalary: 2000000,
        admissionTrend: 0.7,
        industryGrowth: 0.6
      },
      {
        name: "Electrical Engineering",
        cutoff: { general: 1000, obc: 3500, sc: 12000, st: 25000 },
        placementRate: 0.86,
        avgSalary: 780000,
        maxSalary: 2600000,
        admissionTrend: 0.72,
        industryGrowth: 0.65
      }
    ]
  },
  // 9
  {
    name: "National Institute of Engineering (NIE)",
    location: "Mysuru, Karnataka",
    fees: 100000,
    infraRating: 4.4,
    type: "Private",
    established: 1946,
    accreditation: "AICTE, NBA",
    description: "Prestigious college in Mysuru with consistent placements and strong alumni network.",
    image: "https://www.nie.edu.in/sites/default/files/nie-campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science Engineering",
        cutoff: { general: 2200, obc: 7000, sc: 18000, st: 38000 },
        placementRate: 0.9,
        avgSalary: 900000,
        maxSalary: 3000000,
        admissionTrend: 0.85,
        industryGrowth: 0.8
      },
      {
        name: "Mechanical Engineering",
        cutoff: { general: 6000, obc: 20000, sc: 50000, st: 100000 },
        placementRate: 0.75,
        avgSalary: 600000,
        maxSalary: 1800000,
        admissionTrend: 0.6,
        industryGrowth: 0.6
      }
    ]
  },
  // 10
  {
    name: "JSS Science & Technology University (SJCE)",
    location: "Mysuru, Karnataka",
    fees: 90000,
    infraRating: 4.3,
    type: "Private",
    established: 1963,
    accreditation: "AICTE, NBA",
    description: "SJCE provides strong technical programs and steady placements, especially in core branches.",
    image: "https://www.jssstuniv.in/sites/default/files/jssce-campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science & Engineering",
        cutoff: { general: 2000, obc: 7000, sc: 20000, st: 45000 },
        placementRate: 0.9,
        avgSalary: 850000,
        maxSalary: 3200000,
        admissionTrend: 0.85,
        industryGrowth: 0.8
      },
      {
        name: "Electronics & Communication",
        cutoff: { general: 3500, obc: 11000, sc: 30000, st: 60000 },
        placementRate: 0.82,
        avgSalary: 700000,
        maxSalary: 2400000,
        admissionTrend: 0.7,
        industryGrowth: 0.7
      }
    ]
  },
  // 11
  {
    name: "KLE Technological University",
    location: "Hubballi / Belagavi region, Karnataka",
    fees: 90000,
    infraRating: 4.1,
    type: "Private",
    established: 1947,
    accreditation: "AICTE, NAAC",
    description: "Respected institute in north Karnataka with good industry connections.",
    image: "https://www.kletech.ac.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science",
        cutoff: { general: 5000, obc: 15000, sc: 45000, st: 90000 },
        placementRate: 0.86,
        avgSalary: 700000,
        maxSalary: 2200000,
        admissionTrend: 0.78,
        industryGrowth: 0.75
      },
      {
        name: "Civil Engineering",
        cutoff: { general: 12000, obc: 35000, sc: 90000, st: 180000 },
        placementRate: 0.7,
        avgSalary: 420000,
        maxSalary: 1200000,
        admissionTrend: 0.5,
        industryGrowth: 0.5
      }
    ]
  },
  // 12
  {
    name: "Siddaganga Institute of Technology (SIT)",
    location: "Tumakuru, Karnataka",
    fees: 85000,
    infraRating: 4.0,
    type: "Autonomous",
    established: 1963,
    accreditation: "AICTE, NBA",
    description: "Strong regional college with good technical programs and campus life.",
    image: "https://www.sit.ac.in/assets/images/campus.jpg",
    branchesOffered: [
      {
        name: "Information Science",
        cutoff: { general: 7000, obc: 20000, sc: 60000, st: 120000 },
        placementRate: 0.82,
        avgSalary: 650000,
        maxSalary: 2000000,
        admissionTrend: 0.75,
        industryGrowth: 0.7
      },
      {
        name: "Electronics & Communication",
        cutoff: { general: 9000, obc: 28000, sc: 75000, st: 150000 },
        placementRate: 0.8,
        avgSalary: 600000,
        maxSalary: 1800000,
        admissionTrend: 0.7,
        industryGrowth: 0.65
      }
    ]
  },
  // 13
  {
    name: "Nitte Meenakshi Institute of Technology (NMIT)",
    location: "Bengaluru, Karnataka",
    fees: 100000,
    infraRating: 4.2,
    type: "Private",
    established: 2001,
    accreditation: "AICTE, NAAC",
    description: "Popular Bengaluru college under Nitte group with decent placements.",
    image: "https://www.nmit.ac.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science",
        cutoff: { general: 3500, obc: 10000, sc: 35000, st: 70000 },
        placementRate: 0.88,
        avgSalary: 800000,
        maxSalary: 2600000,
        admissionTrend: 0.82,
        industryGrowth: 0.8
      },
      {
        name: "Civil Engineering",
        cutoff: { general: 14000, obc: 40000, sc: 120000, st: 250000 },
        placementRate: 0.65,
        avgSalary: 450000,
        maxSalary: 1200000,
        admissionTrend: 0.45,
        industryGrowth: 0.45
      }
    ]
  },
  // 14
  {
    name: "New Horizon College of Engineering (NHCE)",
    location: "Bengaluru, Karnataka",
    fees: 95000,
    infraRating: 4.0,
    type: "Private",
    established: 2001,
    accreditation: "AICTE, NBA",
    description: "Large private college with many specialized programs and good industry interfaces.",
    image: "https://www.newhorizonindia.edu/nhce/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science",
        cutoff: { general: 6000, obc: 18000, sc: 70000, st: 140000 },
        placementRate: 0.85,
        avgSalary: 700000,
        maxSalary: 2600000,
        admissionTrend: 0.8,
        industryGrowth: 0.75
      },
      {
        name: "Civil Engineering",
        cutoff: { general: 20000, obc: 60000, sc: 200000, st: 400000 },
        placementRate: 0.6,
        avgSalary: 450000,
        maxSalary: 1100000,
        admissionTrend: 0.45,
        industryGrowth: 0.45
      }
    ]
  },
  // 15
  {
    name: "RNS Institute of Technology (RNSIT)",
    location: "Bengaluru, Karnataka",
    fees: 90000,
    infraRating: 4.0,
    type: "Private",
    established: 2001,
    accreditation: "AICTE",
    description: "Well-known for practical oriented courses and active student placements.",
    image: "https://www.rnsit.ac.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science",
        cutoff: { general: 8000, obc: 23000, sc: 80000, st: 160000 },
        placementRate: 0.82,
        avgSalary: 650000,
        maxSalary: 2200000,
        admissionTrend: 0.75,
        industryGrowth: 0.7
      },
      {
        name: "Electronics & Communication",
        cutoff: { general: 12000, obc: 35000, sc: 120000, st: 250000 },
        placementRate: 0.75,
        avgSalary: 550000,
        maxSalary: 1800000,
        admissionTrend: 0.6,
        industryGrowth: 0.6
      }
    ]
  },
  // 16
  {
    name: "Bangalore Institute of Technology (BIT)",
    location: "Bengaluru, Karnataka",
    fees: 88000,
    infraRating: 4.0,
    type: "Private",
    established: 1979,
    accreditation: "AICTE",
    description: "Solid technical college in the heart of Bengaluru with reasonable fees and placements.",
    image: "https://www.bit-bangalore.edu.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science",
        cutoff: { general: 7000, obc: 22000, sc: 70000, st: 140000 },
        placementRate: 0.83,
        avgSalary: 680000,
        maxSalary: 2200000,
        admissionTrend: 0.75,
        industryGrowth: 0.72
      },
      {
        name: "Mechanical Engineering",
        cutoff: { general: 15000, obc: 45000, sc: 150000, st: 300000 },
        placementRate: 0.68,
        avgSalary: 500000,
        maxSalary: 1400000,
        admissionTrend: 0.5,
        industryGrowth: 0.5
      }
    ]
  },
  // 17
  {
    name: "Acharya Institute of Technology",
    location: "Bengaluru, Karnataka",
    fees: 85000,
    infraRating: 3.9,
    type: "Private",
    established: 1980,
    accreditation: "AICTE",
    description: "Large private institute with multiple specializations and campus activities.",
    image: "https://www.acharya.ac.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science",
        cutoff: { general: 10000, obc: 30000, sc: 100000, st: 220000 },
        placementRate: 0.78,
        avgSalary: 550000,
        maxSalary: 1800000,
        admissionTrend: 0.65,
        industryGrowth: 0.6
      },
      {
        name: "Civil Engineering",
        cutoff: { general: 22000, obc: 65000, sc: 240000, st: 480000 },
        placementRate: 0.55,
        avgSalary: 380000,
        maxSalary: 1000000,
        admissionTrend: 0.4,
        industryGrowth: 0.45
      }
    ]
  },
  // 18
  {
    name: "Reva University (Reva College of Engineering)",
    location: "Bengaluru, Karnataka",
    fees: 100000,
    infraRating: 4.1,
    type: "Private",
    established: 2002,
    accreditation: "AICTE, NAAC",
    description: "Modern campus and active industry partnerships; popular among local students.",
    image: "https://reva.edu.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science",
        cutoff: { general: 9000, obc: 28000, sc: 90000, st: 180000 },
        placementRate: 0.8,
        avgSalary: 650000,
        maxSalary: 2100000,
        admissionTrend: 0.7,
        industryGrowth: 0.7
      }
    ]
  },
  // 19
  {
    name: "Presidency University - College of Engineering",
    location: "Bengaluru, Karnataka",
    fees: 130000,
    infraRating: 4.0,
    type: "Private",
    established: 2013,
    accreditation: "AICTE",
    description: "Relatively new private university with fast-growing reputation in Bengaluru.",
    image: "https://presidencyuniversity.in/assets/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science",
        cutoff: { general: 6500, obc: 20000, sc: 70000, st: 150000 },
        placementRate: 0.84,
        avgSalary: 720000,
        maxSalary: 2400000,
        admissionTrend: 0.78,
        industryGrowth: 0.75
      }
    ]
  },
  // 20
  {
    name: "The Oxford College of Engineering",
    location: "Bengaluru, Karnataka",
    fees: 85000,
    infraRating: 3.9,
    type: "Private",
    established: 1974,
    accreditation: "AICTE",
    description: "Established college with wide alumni base and regionally good placements.",
    image: "https://www.theoxford.edu/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science",
        cutoff: { general: 12000, obc: 35000, sc: 130000, st: 260000 },
        placementRate: 0.75,
        avgSalary: 580000,
        maxSalary: 2000000,
        admissionTrend: 0.68,
        industryGrowth: 0.65
      }
    ]
  },
  // 21
  {
    name: "MVJ College of Engineering",
    location: "Bengaluru, Karnataka",
    fees: 90000,
    infraRating: 4.0,
    type: "Private",
    established: 1982,
    accreditation: "AICTE",
    description: "Good regional college with consistent campus placements in core companies.",
    image: "https://www.mvjce.edu.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science",
        cutoff: { general: 8000, obc: 24000, sc: 80000, st: 160000 },
        placementRate: 0.8,
        avgSalary: 640000,
        maxSalary: 2200000,
        admissionTrend: 0.72,
        industryGrowth: 0.7
      }
    ]
  },
  // 22
  {
    name: "SJB Institute of Technology (SJBIT)",
    location: "Bengaluru, Karnataka",
    fees: 82000,
    infraRating: 3.9,
    type: "Private",
    established: 2001,
    accreditation: "AICTE",
    description: "Popular private engineering college in southeast Bengaluru with active campus placements.",
    image: "https://www.sjbit.edu.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science",
        cutoff: { general: 9000, obc: 26000, sc: 90000, st: 180000 },
        placementRate: 0.78,
        avgSalary: 600000,
        maxSalary: 2000000,
        admissionTrend: 0.7,
        industryGrowth: 0.68
      }
    ]
  },
  // 23
  {
    name: "Bapuji Institute of Engineering & Technology (BIET)",
    location: "Davangere, Karnataka",
    fees: 75000,
    infraRating: 3.8,
    type: "Private",
    established: 1979,
    accreditation: "AICTE",
    description: "Well-regarded college in central Karnataka with a strong regional presence.",
    image: "https://www.bietdvg.edu.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Mechanical Engineering",
        cutoff: { general: 28000, obc: 80000, sc: 250000, st: 480000 },
        placementRate: 0.62,
        avgSalary: 420000,
        maxSalary: 1200000,
        admissionTrend: 0.45,
        industryGrowth: 0.45
      }
    ]
  },
  // 24
  {
    name: "P A College of Engineering",
    location: "Mangaluru, Karnataka",
    fees: 80000,
    infraRating: 3.9,
    type: "Private",
    established: 1980,
    accreditation: "AICTE",
    description: "Well-known coastal Karnataka college with steady industry ties in Mangalore.",
    image: "https://www.pacollege.edu.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Civil Engineering",
        cutoff: { general: 16000, obc: 48000, sc: 140000, st: 300000 },
        placementRate: 0.68,
        avgSalary: 480000,
        maxSalary: 1400000,
        admissionTrend: 0.55,
        industryGrowth: 0.5
      },
      {
        name: "Computer Science",
        cutoff: { general: 8500, obc: 24000, sc: 90000, st: 180000 },
        placementRate: 0.8,
        avgSalary: 640000,
        maxSalary: 2100000,
        admissionTrend: 0.75,
        industryGrowth: 0.72
      }
    ]
  },
  // 25
  {
    name: "Basaveshwara Engineering College",
    location: "Bagalkot, Karnataka",
    fees: 70000,
    infraRating: 3.7,
    type: "Private",
    established: 2008,
    accreditation: "AICTE",
    description: "Regional engineering college serving north Karnataka with practical curriculum.",
    image: "https://www.basaveshwaracollege.ac.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science",
        cutoff: { general: 20000, obc: 60000, sc: 220000, st: 420000 },
        placementRate: 0.6,
        avgSalary: 420000,
        maxSalary: 1100000,
        admissionTrend: 0.5,
        industryGrowth: 0.45
      }
    ]
  },
  // 26
  {
    name: "B.V. Bhoomaraddi College of Engineering & Technology (BVBCET)",
    location: "Hubballi, Karnataka",
    fees: 76000,
    infraRating: 3.8,
    type: "Private",
    established: 1979,
    accreditation: "AICTE",
    description: "Established regional technical college with good alumni and placements for core branches.",
    image: "https://www.bvb.edu/images/campus.jpg",
    branchesOffered: [
      {
        name: "Electronics & Communication",
        cutoff: { general: 15000, obc: 42000, sc: 150000, st: 300000 },
        placementRate: 0.72,
        avgSalary: 520000,
        maxSalary: 1600000,
        admissionTrend: 0.6,
        industryGrowth: 0.6
      }
    ]
  },
  // 27
  {
    name: "St. Joseph Engineering College (SJEC)",
    location: "Mangaluru, Karnataka",
    fees: 90000,
    infraRating: 4.0,
    type: "Private",
    established: 2002,
    accreditation: "AICTE",
    description: "Recognized coastal Karnataka engineering college with steady placements and campus culture.",
    image: "https://www.sjec.ac.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science",
        cutoff: { general: 12000, obc: 35000, sc: 120000, st: 250000 },
        placementRate: 0.8,
        avgSalary: 600000,
        maxSalary: 2000000,
        admissionTrend: 0.7,
        industryGrowth: 0.68
      }
    ]
  },
  // 28
  {
    name: "KVG College of Engineering",
    location: "Sullia, Karnataka",
    fees: 70000,
    infraRating: 3.6,
    type: "Private",
    established: 2006,
    accreditation: "AICTE",
    description: "Regional college with local industry links and vocational focus.",
    image: "https://www.kvgengg.org/images/campus.jpg",
    branchesOffered: [
      {
        name: "Computer Science",
        cutoff: { general: 22000, obc: 70000, sc: 260000, st: 520000 },
        placementRate: 0.55,
        avgSalary: 380000,
        maxSalary: 1000000,
        admissionTrend: 0.45,
        industryGrowth: 0.4
      }
    ]
  },
  // 29
  {
    name: "M.S. Ramaiah University of Applied Sciences (Engineering)",
    location: "Bengaluru, Karnataka",
    fees: 140000,
    infraRating: 4.3,
    type: "Private",
    established: 2013,
    accreditation: "AICTE",
    description: "Applied sciences university with engineering programs and strong industry tie-ups.",
    image: "https://www.msruas.ac.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Data Science / AI",
        cutoff: { general: 4000, obc: 12000, sc: 50000, st: 110000 },
        placementRate: 0.82,
        avgSalary: 820000,
        maxSalary: 2600000,
        admissionTrend: 0.8,
        industryGrowth: 0.85,
        isBooming: true
      }
    ]
  },
  // 30
  {
    name: "Government Engineering College, Hassan",
    location: "Hassan, Karnataka",
    fees: 45000,
    infraRating: 3.7,
    type: "Government",
    established: 2007,
    accreditation: "AICTE",
    description: "State government engineering college serving Hassan region with government fees and quotas.",
    image: "https://gechassan.ac.in/images/campus.jpg",
    branchesOffered: [
      {
        name: "Electrical & Electronics",
        cutoff: { general: 16000, obc: 48000, sc: 160000, st: 320000 },
        placementRate: 0.6,
        avgSalary: 420000,
        maxSalary: 1200000,
        admissionTrend: 0.5,
        industryGrowth: 0.5
      }
    ]
  }
];

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Create default admin if not exists
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new Admin({
        username: 'admin',
        password: 'admin' // for demo only — hash in production!
      });
      await admin.save();
      console.log('Default admin created');
    }

    // Seed colleges
    await College.deleteMany({});
    await College.insertMany(karnatakaColleges);

    return NextResponse.json({
      message: 'Karnataka colleges seeded successfully',
      collegesCount: karnatakaColleges.length
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
