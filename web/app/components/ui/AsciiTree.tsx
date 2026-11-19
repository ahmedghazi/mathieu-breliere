import clsx from "clsx";
import React, { ReactNode, useEffect, useState } from "react";
import "./AsciiTree.scss";

type Props = {
  children: ReactNode;
  withBottom?: boolean;
};
const AsciiTree = ({ children, withBottom = false }: Props) => {
  const gap = 5;
  const ref = React.useRef<HTMLDivElement>(null);
  const [y, setY] = useState<number>(gap);
  const [hover, setHover] = useState<boolean | null>(null);
  const _onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const relativeY =
      e.clientY - (e.currentTarget as HTMLElement).getBoundingClientRect().top;
    setY(relativeY);
    setHover(true);
  };

  const _onMouseLeave = () => {
    setHover(false);
    if (!ref.current) return;
    const current = ref.current?.querySelector(".is-active");
    if (current) {
      const rect = current.getBoundingClientRect();
      const relativeY =
        rect.top - ref.current.getBoundingClientRect().top + gap;
      setY(relativeY);
    } else {
      setY(gap);
    }
  };

  useEffect(() => {
    window.addEventListener("wheel", () => {
      _onMouseLeave();
    });
    window.addEventListener("touchend", () => {
      _onMouseLeave();
    });
    return () => {
      window.removeEventListener("wheel", () => {
        _onMouseLeave();
      });
      window.removeEventListener("touchend", () => {
        _onMouseLeave();
      });
    };
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={_onMouseMove}
      onMouseLeave={_onMouseLeave}
      className={clsx(
        "ascii-tree",
        hover && "is-hovered",
        withBottom && "with-bottom",
      )}
      style={{ "--y": `${y}px` } as React.CSSProperties}>
      <div className='box-drawings-light-horizontal'></div>
      {children}
    </div>
  );
};

export default AsciiTree;
