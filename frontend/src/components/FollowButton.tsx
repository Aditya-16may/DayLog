"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { Loader2Icon } from "lucide-react";
import {toggleFollow} from "@/actions/user.action"

function FollowButton({ userId }: {userId: string}) {
    const handleFollow = async ()=>{
        setIsLoading(true);
        try{
            const result = await toggleFollow(userId);

            if (!result.success) {
              if (result.code === "UNAUTHORIZED") {
                // open Clerk sign-in modal or redirect to sign-in
                toast.error("Please sign in to follow users");
                return;
              }

              toast.error(result.error ?? "Something went wrong");
              return;
            }

        toast.success("Follow updated");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }catch(error){
            toast.error("Error FOllowing the user")
        }finally{
            setIsLoading(false)
        }
    }
    const [isLoading, setIsLoading] = useState(false)
  return (
    <Button
      size={"sm"}
      variant={"secondary"}
      onClick={handleFollow}
      disabled={isLoading}
      className="w-20"
    >
      {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : "Follow"}
    </Button>
  );
}
export default FollowButton;
