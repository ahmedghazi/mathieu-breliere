import React from "react";
import {
  Settings,
  SETTINGS_QUERY_RESULT,
} from "../sanity-api/types/sanity.types";
import Nav from "./Nav";
import Link from "next/link";

type Props = {
  // settings: Settings;
  settings: NonNullable<SETTINGS_QUERY_RESULT>;
};

const Header = ({ settings }: Props) => {
  return (
    <header>
      <div className='h-media-h spacer'></div>
      <div className='flex flex-col justify-between md:grid md:grid-cols-8 gap-sm'>
        <div className='site-name'>
          <Link href='/'>{settings.siteName}</Link>
        </div>
        <div className='nav-container'>
          <Nav navPrimary={settings.navPrimary} navTags={settings.navTags} />
        </div>
      </div>
    </header>
  );
};

export default Header;
