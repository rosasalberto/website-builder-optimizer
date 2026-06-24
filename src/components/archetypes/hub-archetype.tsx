import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Hero, type HeroProps } from "@/components/sections";

export interface HubItem {
  title: string;
  description: string;
  href: string;
}

export interface HubGroup {
  title: string;
  description?: string;
  items: HubItem[];
}

export interface HubArchetypeProps {
  hero: HeroProps;
  groups: HubGroup[];
}

/** Index / directory page: a Hero above grouped cards that link onward. */
export function HubArchetype({ hero, groups }: HubArchetypeProps) {
  return (
    <>
      <Hero {...hero} compact />
      <div className="bg-background py-16 md:py-24">
        <Container className="flex flex-col gap-16">
          {groups.map((group, i) => (
            <section key={i}>
              <h2 className="text-2xl font-semibold tracking-tight">{group.title}</h2>
              {group.description && (
                <p className="mt-2 max-w-2xl text-muted-foreground">{group.description}</p>
              )}
              <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item, j) => (
                  <li key={j}>
                    <Link href={item.href} className="group block h-full">
                      <Card className="h-full transition-colors group-hover:border-brand">
                        <CardTitle className="flex items-center justify-between gap-2">
                          {item.title}
                          <ArrowRight
                            aria-hidden
                            className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                          />
                        </CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </Container>
      </div>
    </>
  );
}
