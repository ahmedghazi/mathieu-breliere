import React from "react";
import { Settings } from "../sanity-api/types/sanity.types";
import Nav from "./Nav";

type Props = {
  settings: Settings;
};

const Header = ({ settings }: Props) => {
  return (
    <header>
      <div className='grid grid-cols-4 gap-4'>
        <div className='site-name col-span-2'>{settings.siteName}</div>
        <Nav input={settings.navPrimary} />
      </div>
    </header>
  );
};

export default Header;
