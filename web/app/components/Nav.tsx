"use client";
import React from "react";
import { _linkResolver } from "../sanity-api/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_QUERY_RESULT } from "../sanity-api/types/sanity.types";
import { usePageContext } from "../context/PageContext";

type Props = {
  input: SETTINGS_QUERY_RESULT["navPrimary"];
};

const Nav = ({ input }: Props) => {
  const { isInfos, setIsInfos } = usePageContext();
  const pathname = usePathname();
  const handleClick = (target: string) => {
    const element = document.getElementById(target);
    if (element) {
      element.classList.toggle("is-active");
    }
  };
  return (
    <nav>
      {/* <LocalesSwitcher /> */}
      <div className='bottom'>
        <ul className='menu'>
          {input?.map((item) => (
            <li key={item._key}>
              {item._type === "linkInternal" && (
                <Link
                  className={
                    pathname === _linkResolver(item.link) ? "is-active" : ""
                  }
                  href={_linkResolver(item.link)}>
                  {item.label}
                </Link>
              )}
              {item._type === "linkOverlay" && (
                <button
                  className={isInfos ? "is-active" : ""}
                  onClick={() => setIsInfos(!isInfos)}>
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Nav;
