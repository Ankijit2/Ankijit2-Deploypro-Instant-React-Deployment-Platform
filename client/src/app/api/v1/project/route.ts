import { NextRequest, NextResponse } from "next/server";
import { ProjectSchema } from "@/type";
import { prisma } from "@/lib/prisma-client";
import { generateSlug } from "random-word-slugs";
import { auth } from "@/auth";
export const POST = async (req: NextRequest) => {
  try {
    
    const session = await auth();
    console.log(session?.user);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const safeParseResult = ProjectSchema.safeParse(body);

    if (safeParseResult.error) {
      return NextResponse.json(
        { error: safeParseResult.error },
        { status: 400 }
      );
    }
    const project = await prisma.project.create({
      data: {
        name: safeParseResult.data.name,
        gitURL: safeParseResult.data.gitURL,
        subDomain: generateSlug(),
        userId: session?.user?.id || "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const projects = await prisma.project.findMany({
      where: {
        userId: session?.user?.id || "user",
        ...(id && { id: id }),
        
      },
      include:{
        Deployement: true
      }
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
};

export const PUT = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Missing id parameter" },
      { status: 400 }
    );
  }
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const safeParseResult = ProjectSchema.safeParse(body);
    if (safeParseResult.error) {
      return NextResponse.json(
        { error: safeParseResult.error },
        { status: 400 }
      );
    }
    const project = await prisma.project.update({
      where: {
        id: id,
      },
      data: {
        name: safeParseResult.data.name,
        gitURL: safeParseResult.data.gitURL,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
};

export const DELETE = async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Missing id parameter" },
      { status: 400 }
    );
  }
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const project = await prisma.project.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    
    return NextResponse.json({ error: error }, { status: 500 });
   
  }
};
