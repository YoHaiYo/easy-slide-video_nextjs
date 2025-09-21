import { prisma } from "@/utils/prisma";

export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { id: "desc" } });
  return Response.json(users);
}

export async function POST(req) {
  const { email, name } = await req.json();
  const user = await prisma.user.create({ data: { email, name } });
  return Response.json(user);
}

export async function PUT(req) {
  const { id, email, name } = await req.json();
  const user = await prisma.user.update({
    where: { id },
    data: { email, name },
  });
  return Response.json(user);
}

export async function DELETE(req) {
  const { id } = await req.json();
  await prisma.user.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
