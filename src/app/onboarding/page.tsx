import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  const { supabase, user } = await requireUser();

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-start justify-center bg-zinc-50 px-4 py-10 sm:items-center sm:py-16">
      <OnboardingWizard />
    </div>
  );
}
