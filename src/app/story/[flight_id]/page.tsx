import type { Metadata } from "next";
import StoryPage from "./components/StoryPage";

interface PageProps {
  params: Promise<{ flight_id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { flight_id } = await params;
  const display = flight_id.replace(/_/g, " ");
  return {
    title: `${display} — SkyPrint Flight Story`,
    description: `Detailed contrail warming analysis for flight ${display}`,
  };
}

export default async function StoryFlightPage({ params }: PageProps) {
  const { flight_id } = await params;
  return <StoryPage flightId={flight_id} />;
}
