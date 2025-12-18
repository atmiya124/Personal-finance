import Header from "@/components/Header";
import { Suspense } from "react";

type Props = {
    children : React.ReactNode;
}
const DashboardLayout = ({ children  }: Props) => {
    return ( 
        <Suspense fallback={<div className="w-full flex justify-center items-center h-96"><div className="w-32 h-8 bg-gray-100 animate-pulse rounded" /></div>}>
            <Header />
            <main className="px-3 lg:px-14">
                { children }
            </main>
        </Suspense>
     );
}
 
export default DashboardLayout;