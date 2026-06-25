import Navbar from "@/components/landing-page/Navbar";
import { ReactNode } from "react";

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div
        id="home"
        className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] h-full"
      />
      <Navbar />
      <main className="mt-20 mx-auto w-full z-0 relative">{children}</main>
    </>
  );
}
