import GreengrassDetail from "../_component/detail/GreengrassDetail";
import ky from "ky"
import supabase from "@/app/utils/database";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data } = await supabase.from("garden").select().eq("id", id).single();

  const title = data?.title;
  const description = data?.content?.slice?.(0, 80) || data?.location;

  const ogImage = "https://next-market-beta-dun.vercel.app/gardenNoPic.png";

  return {
    metadataBase: new URL("https://next-market-beta-dun.vercel.app"),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export async function GreengrassDetailPage({ params }) {
  const { id } = await params;
  return <GreengrassDetail id={id} showToolbar={false} />;
}
export default GreengrassDetailPage;