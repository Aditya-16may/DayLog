"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return null;

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) return existingUser;

    const email = user.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      throw new Error("User email not found from Clerk");
    }

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        username:
          user.username ??
          email.split("@")[0] + Math.floor(Math.random() * 10000),
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.error("Error in syncUser:", error);
    throw error;
  }
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

export async function getUserByClerkIdSimple(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
  });
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();

  // Signed-out user visiting a public page
  if (!clerkId) return null;

  let user = await getUserByClerkIdSimple(clerkId);

  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

    const baseUsername =
      clerkUser.username ||
      email.split("@")[0] ||
      `user_${clerkUser.id.slice(-6)}`;

    const username = `${baseUsername}_${clerkUser.id.slice(-4)}`;

    const name =
      `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
      baseUsername;

    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        username,
        name,
        image: clerkUser.imageUrl,
      },
    });
  }

  return user.id;
}

export async function getRandomUser() {
  try {
    const userId = await getDbUserId();

    const randomUsers = await prisma.user.findMany({
      where: userId
        ? {
            id: { not: userId },
            followers: {
              none: {
                followersId: userId,
              },
            },
          }
        : {},
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 3,
    });

    return randomUsers;
  } catch (error) {
    console.error("Error fetching random users:", error);
    return [];
  }
}

export async function toggleFollow(targetuserId: string) {
  try {
    const userId = await getDbUserId();

    // 1) Block signed-out users immediately
    if (!userId) {
      return {
        success: false,
        error: "Please sign in to follow users",
        code: "UNAUTHORIZED",
      };
    }

    // 2) Prevent self-follow
    if (userId === targetuserId) {
      return {
        success: false,
        error: "You cannot follow yourself",
        code: "SELF_FOLLOW",
      };
    }

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followersId_followingId: {
          followersId: userId,
          followingId: targetuserId,
        },
      },
    });

    if (existingFollow) {
      await prisma.follows.delete({
        where: {
          followersId_followingId: {
            followersId: userId,
            followingId: targetuserId,
          },
        },
      });
    } else {
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followersId: userId,
            followingId: targetuserId,
          },
        }),
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetuserId,
            creatorId: userId,
          },
        }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Something went wrong:", error);
    return {
      success: false,
      error: "Error toggling follow",
      code: "UNKNOWN_ERROR",
    };
  }
}