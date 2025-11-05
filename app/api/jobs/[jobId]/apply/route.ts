import { auth } from "@/auth.server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await context.params; // 👈 await the params

  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return new NextResponse("Job not found", { status: 404 });
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        userId: session.user.id,
      },
    });

    if (existingApplication) {
      return new NextResponse("Already applied for this job", { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        userId: session.user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Apply job error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
