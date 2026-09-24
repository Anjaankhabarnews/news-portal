import { site, whatsappLink, whatsappMessages } from "@/config/site";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/icons";

const icons = { instagram: InstagramIcon, facebook: FacebookIcon } as const;

/** Official channels only (see src/config/site.ts). */
export function SocialLinks({
  size = 18,
  className = "",
  itemClass = "text-white/80 hover:text-white",
  includeWhatsApp = false,
}: {
  size?: number;
  className?: string;
  itemClass?: string;
  includeWhatsApp?: boolean;
}) {
  return (
    <ul className={`flex items-center ${className}`}>
      {site.social.map((s) => {
        const Icon = icons[s.id];
        return (
          <li key={s.id}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener me"
              className={`grid size-10 place-items-center transition-colors ${itemClass}`}
              aria-label={`${site.name} on ${s.label} (opens in new tab)`}
            >
              <Icon size={size} />
            </a>
          </li>
        );
      })}
      {includeWhatsApp ? (
        <li>
          <a
            href={whatsappLink(whatsappMessages.general)}
            target="_blank"
            rel="noopener"
            className={`grid size-10 place-items-center transition-colors ${itemClass}`}
            aria-label={`WhatsApp ${site.contact.whatsappDisplay} (opens in new tab)`}
          >
            <WhatsAppIcon size={size} />
          </a>
        </li>
      ) : null}
    </ul>
  );
}
