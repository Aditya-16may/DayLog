"use server"

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action"

export async function getNotifications() {
  try {
    const userId = await getDbUserId();

    if (!userId) {
      return {
        success: false,
        error: "Please sign in to see the notifications page",
        code: "UNAUTHORIZED" as const,
      };
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            image: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      notifications,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch notifications",
    };
  }
}

export async function markNotificationsAsRead(notificationIds: string[]){
    try{
        await prisma.notification.updateMany({
            where:{
                id:{
                    in:notificationIds,
                }
            },
            data:{
                read: true,
            },
        });
        return {success: true};
    } catch(error){
        return{
            success: false,
            error: error instanceof Error ? error.message : "Something went wrong.."
        }
    }
}