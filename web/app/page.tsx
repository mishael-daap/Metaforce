import { Metadata } from "next";
import { auth } from "./auth"

export const metadata: Metadata = {
  title: "Home",
};

export default async function Page(){
  const session = await auth()
  return <div>{session?.user?.name} or wtf</div>
}