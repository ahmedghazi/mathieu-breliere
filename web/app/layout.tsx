import "./styles/index.scss";
import "./global.css";
import Header from "./components/Header";
import website from "./config/website";
import { PageContextProvider } from "./context/PageContext";
import { getContentInfos, getSettings } from "./sanity-api/sanity-queries";
import { LocaleContextProvider } from "./context/LocaleContext";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "./sanity-api/sanity.live";
import ContentInfos from "./components/ContentInfos";
import { ViewTransition } from "react";
import Splash from "./components/Splash";

export const metadata = {
  metadataBase: new URL(website.url),
  title: {
    template: `%s — ${website.title}`,
  },
  description: website.description,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const infos = await getContentInfos();
  const { isEnabled } = await draftMode();

  return (
    <html lang='fr'>
      <body className={"is-loading"} data-theme='theme-xyz'>
        <LocaleContextProvider>
          <PageContextProvider>
            <script dangerouslySetInnerHTML={{ __html: "0" }} />
            <Splash
              siteName={settings?.siteName || ""}
              baseline={settings?.baseline || ""}
            />
            <div id='page' className=''>
              {settings && <Header settings={settings} />}
              {infos && <ContentInfos input={infos} />}
              <ViewTransition>
                <main>{children}</main>
              </ViewTransition>
            </div>
            {/* <Footer settings={settings} /> */}
            {/* <DesignSystem /> */}
            <SanityLive />
            {isEnabled && <VisualEditing zIndex={1000} />}
          </PageContextProvider>
        </LocaleContextProvider>
      </body>
    </html>
  );
}
