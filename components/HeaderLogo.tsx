import Image from "next/image";
import Link from "next/link";


const HeaderLogo = () => {
    return ( 
        <Link href="/">
            <div className="items-center hidden lg:flex">
                <Image src="/AP-logo.svg" height={25} width={25} alt="logo" />
                <p className="font-semibold text-white text-2xl ml-2.5">
                    Personal Finance
                </p>
            </div>
        </Link>
     );
}
 
export default HeaderLogo;