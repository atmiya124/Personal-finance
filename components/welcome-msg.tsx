"use client"

import { useUser } from "@clerk/nextjs";

const WelcomeMsg = () => {
    const {user, isLoaded} = useUser();

    return ( 
        <div className="space-y-2 mb-4">
            <h2 className="text-2xl text-white font-medium lg:text-4xl">
                Welcome Back{isLoaded ? ", " : " "}{user?.firstName}👋
            </h2>
            <p className="text-sm lg:text-base text-[#89b6fd]">
                This is your Finiacial Overview report
            </p>
        </div>
     );
}
 
export default WelcomeMsg;