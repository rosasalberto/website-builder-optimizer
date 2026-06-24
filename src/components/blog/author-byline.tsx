import Image from "next/image";
import type { Author } from "@/payload-types";
import { cn } from "@/lib/utils";

export interface AuthorBylineProps {
  author: Author;
  /** Optional secondary line, e.g. a formatted publish date or read time. */
  dateLine?: string;
  className?: string;
}

/**
 * Author attribution for E-E-A-T (Experience, Expertise, Authoritativeness,
 * Trustworthiness): avatar, name (marked rel="author"), job title /
 * credentials, and any external profile links.
 */
export function AuthorByline({ author, dateLine, className }: AuthorBylineProps) {
  const avatar = typeof author.avatar === "object" && author.avatar ? author.avatar : null;
  const role = author.jobTitle ?? author.credentials ?? null;
  const links = (author.sameAs ?? []).filter((s) => s?.url);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {avatar?.url ? (
        <Image
          src={avatar.url}
          alt={avatar.alt ?? author.name}
          width={44}
          height={44}
          className="size-11 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-11 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground"
        >
          {author.name.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="text-sm leading-tight">
        <span rel="author" className="font-semibold text-foreground">
          {author.name}
        </span>
        {role && <p className="text-muted-foreground">{role}</p>}
        {dateLine && <p className="text-muted-foreground">{dateLine}</p>}
        {links.length > 0 && (
          <p className="mt-0.5 flex flex-wrap gap-2">
            {links.map((s, i) => (
              <a
                key={i}
                href={s.url ?? "#"}
                target="_blank"
                rel="noopener noreferrer me"
                className="text-xs text-brand hover:underline"
              >
                {s.id || "Profile"}
              </a>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
