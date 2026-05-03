// the / route - just sends everyone to /feed (guests can browse it)
import { redirect } from "next/navigation";
export default function Home() { redirect("/feed"); }
