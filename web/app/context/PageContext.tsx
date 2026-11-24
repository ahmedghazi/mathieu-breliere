"use client";
import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { NavTag } from "../sanity-api/types";
// import { getSettings } from "../utils/sanity-queries";

type PageContextType = {
  settings: {
    pathname: string;
  };
  isInfos: boolean;
  setIsInfos: (isInfos: boolean) => void;
  tag: NavTag | null;
  setTag: (tag: NavTag | null) => void;
  splashed: boolean;
  setSplashed: (val: boolean) => void;
};

const PageContext = createContext<PageContextType>({
  settings: {
    pathname: "",
  },
  isInfos: false,
  setIsInfos: () => {},
  tag: null,
  setTag: () => {},
  splashed: false,
  setSplashed: () => {},
});

interface PageContextProps {
  // location?: object;
  children: ReactNode;
  // pageContext: object;
}

export const PageContextProvider = (props: PageContextProps) => {
  const { children } = props;
  const pathname = usePathname();
  // console.log(pathname);
  const [isInfos, setIsInfos] = useState<boolean>(false);
  const [splashed, setSplashed] = useState<boolean>(false);
  const [tag, setTag] = useState<NavTag | null>(null);
  const settings = {
    pathname,
  };

  useEffect(() => {
    _format();
    window.addEventListener("resize", _format);

    return () => {
      window.removeEventListener("resize", _format);
    };
  }, []);

  useEffect(() => {
    setIsInfos(false);
  }, [pathname]);

  const _format = () => {
    // const wh = window.innerHeight;

    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    // document.documentElement.style.setProperty("--app-height", wh + "px");

    const header = document.querySelector("header");
    let headerBounding = { height: 50 };
    if (header) {
      headerBounding = header.getBoundingClientRect();

      document.documentElement.style.setProperty(
        "--header-h",
        headerBounding.height + "px",
      );
    }
  };

  return (
    <PageContext.Provider
      value={{
        settings,
        isInfos,
        setIsInfos,
        tag,
        setTag,
        splashed,
        setSplashed,
      }}>
      {children}
    </PageContext.Provider>
  );
};

// export default PageContext;
// export { PageContext, PageContextProvider };

export const usePageContext = () => useContext(PageContext);
