// Next.js API route handler for seed data
import { NextResponse } from 'next/server';
import { realColleges } from './data';

export async function GET() {
  return NextResponse.json({ 
    message: 'Seed data available',
    count: realColleges.length 
  });
}
