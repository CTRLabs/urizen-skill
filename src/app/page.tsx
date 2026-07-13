import { redirect } from "next/navigation";

// The skill has no UI — it is an API + manifest. Land on the machine-readable skill.
export default function Home() {
  redirect("/api/skill");
}
