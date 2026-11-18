"use client";
import React from "react";
import { _linkResolver } from "../sanity-api/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_QUERY_RESULT } from "../sanity-api/types/sanity.types";
import { usePageContext } from "../context/PageContext";
import NavTags from "./NavTags";

type Props = {
  navPrimary: NonNullable<SETTINGS_QUERY_RESULT>["navPrimary"];
  navTags: NonNullable<SETTINGS_QUERY_RESULT>["navTags"];
};

const Nav = ({ navPrimary, navTags }: Props) => {
  const { isInfos, setIsInfos } = usePageContext();
  const pathname = usePathname();
  const isProjects = pathname.includes("/index");

  return (
    <nav>
      <div className='b-l'>
        <ul className='menu'>
          {navPrimary?.map((item) => (
            <li key={item._key} className={""}>
              {item._type === "linkInternal" && (
                <>
                  <Link
                    className={
                      pathname === _linkResolver(item.link) ? "is-active" : ""
                    }
                    href={_linkResolver(item.link)}>
                    <span>{item.label}</span>
                  </Link>
                </>
              )}
              {item._type === "linkOverlay" && (
                <button
                  className={isInfos ? "is-active" : ""}
                  onClick={() => setIsInfos(!isInfos)}>
                  <span>{item.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      {!isInfos && isProjects && <NavTags input={navTags} />}
    </nav>
  );
};

export default Nav;
