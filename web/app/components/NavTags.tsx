import React, { useState } from "react";
import { SETTINGS_QUERY_RESULT } from "../sanity-api/types/sanity.types";
import { usePageContext } from "../context/PageContext";
import clsx from "clsx";
import AsciiTree from "./ui/AsciiTree";

type Props = {
  input: NonNullable<SETTINGS_QUERY_RESULT>["navTags"];
};

const NavTags = ({ input }: Props) => {
  const ref = React.useRef<HTMLUListElement>(null);
  const { tag, setTag } = usePageContext();
  const [y, setY] = useState<number>(0);
  const [hover, setHover] = useState<boolean | null>(null);

  // const _onMouseMove = (e: React.MouseEvent<HTMLUListElement>) => {
  //   const relativeY =
  //     e.clientY - (e.currentTarget as HTMLElement).getBoundingClientRect().top;
  //   setY(relativeY);
  //   setHover(true);
  // };

  // const _onMouseLeave = () => {
  //   setHover(false);
  //   if (!ref.current) return;
  //   const current = ref.current?.querySelector(".is-active");
  //   if (current) {
  //     const rect = current.getBoundingClientRect();
  //     const relativeY = rect.top - ref.current.getBoundingClientRect().top + 5;
  //     setY(relativeY);
  //   }
  // };

  return (
    <AsciiTree>
      <ul
        ref={ref}
        className={clsx(
          "nav-tags",
          tag && "has-tag",
          // hover && "is-hovered",
        )}
        // style={{ "--y": `${y}px` } as React.CSSProperties}
        // onMouseMove={_onMouseMove}
        // onMouseLeave={_onMouseLeave}
      >
        <li>
          <button
            onClick={() => setTag(null)}
            className={!tag ? "is-active" : ""}>
            All
          </button>
        </li>
        {input?.map((item, i) => (
          <li key={i}>
            <button
              onClick={() => {
                const nextTag = tag?._id === item._id ? null : item;
                setTag(nextTag);
              }}
              className={tag?._id === item._id ? "is-active" : ""}>
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </AsciiTree>
  );
};

export default NavTags;
