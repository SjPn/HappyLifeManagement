import { redirect } from "next/navigation";

export default function RootPage() {
  // Safety net for deployments where middleware may not run for "/".
  // Default locale is Ukrainian.
  redirect("/uk");
}

