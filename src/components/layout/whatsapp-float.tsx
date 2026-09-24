"use client";

import { useEffect, useState } from "react";
import { whatsappLink, whatsappMessages } from "@/config/site";
import { WhatsAppIcon } from "@/components/icons";

/**
 * Mobile-only "News tip" button. Appears after the reader scrolls past the
 * first screen and hides again over the footer, so it never covers the header
 * CTA or footer links.
 */
export function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const footer = document.querySelector("footer");
      const nearFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight : false;
      setVisible(window.scrollY > window.innerHeight * 0.9 && !nearFooter);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <a
      href={whatsappLink(whatsappMessages.tip)}
      target="_blank"
      rel="noopener"
      aria-label="Send a news tip on WhatsApp (opens in new tab)"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`on-dark fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex h-12 items-center gap-2 rounded-full bg-navy-900 pr-4 pl-3.5 text-sm font-semibold text-white shadow-menu transition-[opacity,transform] duration-200 lg:hidden ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <WhatsAppIcon size={22} className="text-whatsapp" />
      Tip
    </a>
  );
}
