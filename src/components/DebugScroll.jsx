import { useEffect, useState } from "react";

export default function DebugScroll() {
  const [info, setInfo] = useState("");

  useEffect(() => {
    const update = () => {
      const parts = [];
      let el = document.querySelector("main");
      let i = 0;
      while (el && i < 6) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        parts.push(
          `${el.tagName}=${Math.round(r.height)}/ov:${cs.overflowY}`
        );
        el = el.parentElement;
        i++;
      }
      parts.push(`vh=${window.innerHeight}`);
      setInfo(parts.join(" | "));
    };
    update();
    const t = setInterval(update, 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "red",
        color: "white",
        fontSize: 10,
        padding: "4px 6px",
        zIndex: 999999,
        fontFamily: "monospace",
        wordBreak: "break-all",
        lineHeight: 1.3,
      }}
    >
      {info}
    </div>
  );
}
