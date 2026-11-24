import website from "../config/website";
import { getAllProjects } from "../sanity-api/sanity-queries";
import { _linkResolver } from "../sanity-api/utils";

export const dynamic = "force-static";

export async function GET() {
  let content = `# ${website.title}\n`;
  const projects = await getAllProjects();

  projects.forEach((page) => {
    content += `- [${page.seo?.metaTitle || page.title || ""}]`;
    content += `(${website.url}/${_linkResolver(page)})`;
    content += `: ${page.seo?.metaDescription || ""}\n`;
  });

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
