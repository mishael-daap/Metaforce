import { Metadata } from "next";
import { auth } from "./auth";
import Navbar from "@/components/landing-page/Navbar";
import MaxWidthWrapper from "@/components/landing-page/max-width-wrapper";

export const metadata: Metadata = {
  title: "Home",
};

export default async function Page() {
  const session = await auth();
  return (
    <div className="overflow-x-hidden scrollbar-hide size-full">
       {/* Hero Section */}

            <MaxWidthWrapper>
              <Navbar />
            </MaxWidthWrapper>
    </div>
  );
}
