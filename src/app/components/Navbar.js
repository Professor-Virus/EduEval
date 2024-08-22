import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          EduEval
        </Link>
        <div className="flex items-center space-x-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;