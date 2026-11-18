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
      <div className='grid grid-cols-4 gap-sm'>
        <div className='site-name col-span-2'>
          <Link href='/'>{settings.siteName}</Link>
        </div>
        <div className='col-span-2'>
          <Nav navPrimary={settings.navPrimary} navTags={settings.navTags} />
        </div>
      </div>
    </header>
  );
};

export default Header;
