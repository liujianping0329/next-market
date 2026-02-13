import { NextResponse } from "next/server";
export async function POST(request, context) {
  console.log("Request received in file upload route");
  const formData = await request.formData();
  const files = formData.getAll("files");
  console.log("Files received:", files);
  for (const file of files) {
    console.log(file.name)
    console.log(file.type)
    console.log(file.size)
  }

  return NextResponse.json({ message: "Hello, Next.js!1111" });
}