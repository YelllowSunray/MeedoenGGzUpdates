import { NextResponse } from 'next/server';
import data from '../../lib/data.json';

export async function GET() {
  try {
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
} 