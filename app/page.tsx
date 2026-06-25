import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "upload api is alive" });
}

export async function POST() {
  return NextResponse.json({ success: true, url: "/videos/itscool.mp4" });
} 

