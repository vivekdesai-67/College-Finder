
// import { NextRequest, NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import Student from '@/lib/models/Student';
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// import College from '@/lib/models/College'; // 👈 ensure College is registered
// import { verifyToken, getTokenFromRequest } from '@/lib/auth';
// import mongoose from "mongoose";


// export async function GET(request: NextRequest) {
//   try {
//     const token = getTokenFromRequest(request);
//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     let decoded;
//     try {
//       decoded = verifyToken(token);
//     } catch {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//     }

//     await connectDB();
//     // console.log("Registered models:", Object.keys(mongoose.models));
//     const student = await Student.findById(decoded.id).populate('wishlist');

//     if (!student) {
//       return NextResponse.json({ error: 'Student not found' }, { status: 404 });
//     }

//     return NextResponse.json({
//       id: student._id,
//       username: student.username,
//       email: student.email,
//       address: student.address,
//       rank: student.rank,
//       category: student.category,
//       preferredBranch: student.preferredBranch,
//       profileComplete: student.profileComplete,
//       wishlist: student.wishlist || []
//     });
//   } catch (error) {
//     console.error('Profile fetch error:', error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: NextRequest) {
//   try {
//     const token = getTokenFromRequest(request);
//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     let decoded;
//     try {
//       decoded = verifyToken(token);
//     } catch {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//     }

//     const { rank, category, preferredBranch } = await request.json();

//     const rankNum = Number(rank);
//     if (rank === undefined || isNaN(rankNum) || !category || !preferredBranch) {
//       return NextResponse.json(
//         { error: 'Rank (number), category, and preferred branch are required' },
//         { status: 400 }
//       );
//     }

//     await connectDB();
//     const student = await Student.findByIdAndUpdate(
//       decoded.id,
//       {
//         rank: rankNum,
//         category,
//         preferredBranch,
//         profileComplete: true
//       },
//       { new: true }
//     ).populate('wishlist');

//     if (!student) {
//       return NextResponse.json({ error: 'Student not found' }, { status: 404 });
//     }

//     return NextResponse.json({
//       id: student._id,
//       username: student.username,
//       email: student.email,
//       address: student.address,
//       rank: student.rank,
//       category: student.category,
//       preferredBranch: student.preferredBranch,
//       profileComplete: student.profileComplete,
//       wishlist: student.wishlist || []
//     });
//   } catch (error) {
//     console.error('Profile update error:', error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import College from '@/lib/models/College'; // 👈 ensure College is registered
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const authResult = await auth();
    const clerkUserId = authResult.userId;
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const student = await Student.findOne({ clerkId: clerkUserId }).populate('wishlist');

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Ensure preferredBranch is always an array
    const preferredBranchArray = Array.isArray(student.preferredBranch)
      ? student.preferredBranch
      : student.preferredBranch
      ? [student.preferredBranch]
      : [];

    return NextResponse.json({
      id: student._id,
      username: student.username,
      email: student.email,
      address: student.address,
      rank: student.rank,
      category: student.category,
      preferredBranch: preferredBranchArray,
      profileComplete: student.profileComplete,
      wishlist: student.wishlist || [],
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await auth();
    const clerkUserId = authResult.userId;
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rank, category, preferredBranch, username, email, assignRole } = body;

    const rankNum = Number(rank);
    
    // Ensure preferredBranch is a flat array of strings
    const flattenBranches = (arr: any): string[] => {
      if (!Array.isArray(arr)) {
        return typeof arr === 'string' ? [arr] : [];
      }
      return arr.flatMap(item => 
        Array.isArray(item) ? flattenBranches(item) : (typeof item === 'string' ? [item] : [])
      );
    };
    
    const preferredBranchArray = flattenBranches(preferredBranch);

    if (rank === undefined || isNaN(rankNum) || !category || preferredBranchArray.length === 0) {
      return NextResponse.json(
        { error: 'Rank (number), category, and at least one preferred branch are required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Check if student already exists by clerkId first, then by email
    let student = await Student.findOne({ clerkId: clerkUserId });
    
    if (student) {
      // Update existing student
      student.rank = rankNum;
      student.category = category;
      student.preferredBranch = preferredBranchArray;
      student.profileComplete = true;
      await student.save();
      await student.populate('wishlist');
    } else {
      // Get email from Clerk currentUser
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      const userEmail = clerkUser.emailAddresses[0]?.emailAddress || `${clerkUserId}@clerk.user`;
      const userUsername = clerkUser.username || clerkUser.firstName || `user_${clerkUserId.slice(-8)}`;
      
      // Check if student exists with this email but different clerkId (old record)
      const existingStudentByEmail = await Student.findOne({ email: userEmail });
      
      if (existingStudentByEmail) {
        // Update the existing record with new clerkId
        existingStudentByEmail.clerkId = clerkUserId;
        existingStudentByEmail.rank = rankNum;
        existingStudentByEmail.category = category;
        existingStudentByEmail.preferredBranch = preferredBranchArray;
        existingStudentByEmail.profileComplete = true;
        await existingStudentByEmail.save();
        student = existingStudentByEmail;
      } else {
        // Generate unique username if needed
        let finalUsername = username || userUsername;
        let usernameExists = await Student.findOne({ username: finalUsername });
        let counter = 1;
        
        while (usernameExists) {
          finalUsername = `${username || userUsername}_${counter}`;
          usernameExists = await Student.findOne({ username: finalUsername });
          counter++;
        }
        
        // Create new student
        try {
          student = await Student.create({
            clerkId: clerkUserId,
            username: finalUsername,
            email: userEmail,
            rank: rankNum,
            category,
            preferredBranch: preferredBranchArray,
            profileComplete: true,
            wishlist: [],
          });
        } catch (createError: any) {
          // Handle duplicate key error
          if (createError.code === 11000) {
            // Try to find and update existing record
            const existingStudent = await Student.findOne({ email: userEmail });
            if (existingStudent) {
              existingStudent.clerkId = clerkUserId;
              existingStudent.rank = rankNum;
              existingStudent.category = category;
              existingStudent.preferredBranch = preferredBranchArray;
              existingStudent.profileComplete = true;
              await existingStudent.save();
              student = existingStudent;
            } else {
              throw createError;
            }
          } else {
            throw createError;
          }
        }
      }
    }
    
    // Assign student role if requested and user doesn't have a role yet
    if (assignRole) {
      try {
        const client = await clerkClient();
        const clerkUser = await currentUser();
        
        // Only assign role if user doesn't already have one
        const currentRole = (clerkUser?.publicMetadata as any)?.role || (clerkUser?.privateMetadata as any)?.role;
        
        if (!currentRole) {
          await client.users.updateUser(clerkUserId, {
            publicMetadata: {
              role: 'student'
            },
            privateMetadata: {
              role: 'student'
            }
          });
          console.log('Student role assigned to user:', clerkUserId);
        } else {
          console.log('User already has role:', currentRole);
        }
      } catch (error) {
        console.error('Role assignment error:', error);
        // Don't fail the whole request if role assignment fails
      }
    }
    
    return NextResponse.json({
      id: student._id,
      username: student.username,
      email: student.email,
      address: student.address,
      rank: student.rank,
      category: student.category,
      preferredBranch: student.preferredBranch,
      profileComplete: student.profileComplete,
      wishlist: student.wishlist || [],
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
