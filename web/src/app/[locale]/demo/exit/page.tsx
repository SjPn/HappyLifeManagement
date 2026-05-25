import { exitDemoToLanding } from "@/actions/demo";

export default async function DemoExitPage() {
  await exitDemoToLanding();
}
