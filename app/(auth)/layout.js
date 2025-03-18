import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";

// AuthLayout component
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-10 h-10">
              <div className="absolute w-10 h-10 bg-neutral-900 dark:bg-neutral-100 rounded-full flex items-center justify-center">
                <span className="text-white dark:text-neutral-900 font-bold text-sm">WT</span>
              </div>
            </div>
            <span className="text-2xl font-bold">WatchTower</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-neutral-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-neutral-200 dark:border-neutral-800">
          {children}
        </div>
      </div>
      <Toaster />
    </div>
  );
} 