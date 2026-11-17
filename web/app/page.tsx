import ContentHome from "./components/ContentHome";
import { Metadata } from "next";
import website from "./config/website";
import { getHome } from "./sanity-api/sanity-queries";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getHome(false);
  return {
    title: `${data?.seo?.metaTitle || data?.title || ""}`,
    description: data?.seo?.metaDescription,
    openGraph: {
      images: data?.seo?.metaImage?.asset?.url || website.image,
    },
  };
}

export const revalidate = 3600; // revalidate every hour

const HomePage = async () => {
  const data = await getHome();
  if (!data) return notFound();
  return (
    <div className='template template--home' data-template='home'>
      <ContentHome input={data} />
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
};

export default HomePage;
