// import { NextRequest, NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import College from '@/lib/models/College';

// export async function GET(request: NextRequest) {
//   try {
//     await connectDB();
    
//     const { searchParams } = new URL(request.url);
//     const search = searchParams.get('search');
//     const location = searchParams.get('location');
//     const type = searchParams.get('type');
//     const minFees = searchParams.get('minFees');
//     const maxFees = searchParams.get('maxFees');
//     const branch = searchParams.get('branch');
//     const sortBy = searchParams.get('sortBy') || 'name';
//     const sortOrder = searchParams.get('sortOrder') || 'asc';

//     let query: any = {};

//     if (search) {
//       query.name = { $regex: search, $options: 'i' };
//     }

//     if (location) {
//       query.location = { $regex: location, $options: 'i' };
//     }

//     if (type && type !== 'all') {
//       query.type = type;
//     }

//     if (minFees || maxFees) {
//       query.fees = {};
//       if (minFees) query.fees.$gte = parseInt(minFees);
//       if (maxFees) query.fees.$lte = parseInt(maxFees);
//     }

//     if (branch) {
//       query['branchesOffered.name'] = { $regex: branch, $options: 'i' };
//     }

//     const sortObj: any = {};
//     sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

//     const colleges = await College.find(query).sort(sortObj);

//     return NextResponse.json(colleges);
//   } catch (error) {
//     console.error('Colleges fetch error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     await connectDB();
//     const collegeData = await request.json();
    
//     const college = new College(collegeData);
//     await college.save();

//     return NextResponse.json(college, { status: 201 });
//   } catch (error) {
//     console.error('College creation error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import College from '@/lib/models/College';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const type = searchParams.get('type');
    const minFees = searchParams.get('minFees');
    const maxFees = searchParams.get('maxFees');
    const branch = searchParams.get('branch');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    let query: any = {};

    if (search) query.name = { $regex: search, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type && type !== 'all') query.type = type;
    if (minFees || maxFees) {
      query.fees = {};
      if (minFees) query.fees.$gte = parseInt(minFees);
      if (maxFees) query.fees.$lte = parseInt(maxFees);
    }
    if (branch) query['branchesOffered.name'] = { $regex: branch, $options: 'i' };

    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const colleges = await College.find(query).sort(sortObj);
    // console.log(colleges);
    return NextResponse.json(colleges);
  } catch (error) {
    console.error('Colleges fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const collegeData = await request.json();

    const college = new College(collegeData);
    await college.save();

    return NextResponse.json(college, { status: 201 });
  } catch (error) {
    console.error('College creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
