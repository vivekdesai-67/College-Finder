// import { NextRequest, NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import Student from '@/lib/models/Student';

// export async function GET() {
//   try {
//     await connectDB();
//     const students = await Student.find();
//     return NextResponse.json(students);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
//   }
// }

// // PATCH /api/admin/students/:id/complete
// export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     await connectDB();
//     const student = await Student.findByIdAndUpdate(params.id, { profileComplete: true }, { new: true });
//     return NextResponse.json(student);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
//   }
// }

// // DELETE /api/admin/students/:id
// export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     await connectDB();
//     await Student.findByIdAndDelete(params.id);
//     return NextResponse.json({ message: 'Student deleted' });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/lib/models/Student';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Mark profile as complete
    const student = await Student.findByIdAndUpdate(
      id,
      { profileComplete: true },
      { new: true }
    );

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (err) {
    console.error('PATCH student error:', err);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('DELETE student error:', err);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
