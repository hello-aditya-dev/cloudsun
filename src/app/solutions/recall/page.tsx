import { SolutionPage } from "@/components/cloudsun/marketing/SolutionPage";
import { solutions } from "@/config/cloudsun";
const solution = solutions.find((s) => s.slug === "recall")!;
export default function Page() { return <SolutionPage solution={solution} />; }
