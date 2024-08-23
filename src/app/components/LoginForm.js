import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { motion } from "framer-motion";

export default function LoginForm() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <Image
        src="/edubg.jpg"
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0"
        priority
      />
      <motion.div
        className="relative z-10 flex flex-row w-full max-w-5xl bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg"
        initial={{ x: "-100vw", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 50, duration: 0.8 }}
      >
        {/* Left Side - Clerk Login */}
        <div className="w-1/2 flex items-center justify-center">
          <SignIn routing="hash" />
        </div>
        <motion.div
          className="w-1/2 p-4 bg-gray-900 rounded-md shadow-inner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="overflow-y-auto h-96 pr-4">
            <h2 className="text-xl font-bold mb-4 text-white">About This WebApp</h2>
            <p className="text-gray-300 mb-4">
              This web application allows professors to gather sentiment analysis from student reviews found on RateMyProfessor. Simply select a professor from the link below, and our app will scrape all available reviews to perform a comprehensive sentiment analysis.
            </p>
            <a
              href="https://www.ratemyprofessors.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 transition-colors duration-300"
            >
              Rate My Professor
            </a>
            <p className="text-gray-300 mt-4">
              The analysis will provide insights into the overall sentiment of the reviews, helping professors to understand the student perception better and identify areas for improvement. This tool aims to enhance the quality of education by offering actionable feedback based on real student experiences.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
