import "server-only";
import { galleryItems } from "@/content/gallery";
import { coaches } from "@/content/programs";
import { enCoaches } from "@/content/en";
import { ui, type Lang } from "@/content/i18n";
import { site } from "@/content/site";

// JSON-LD del negocio, común a las dos versiones del sitio. En inglés añade
// la descripción traducida y los cargos de los entrenadores en inglés.
export function businessJsonLd(lang: Lang) {
  const team = lang === "en" ? enCoaches() : coaches;
  return {
    "@context": "https://schema.org",
    // Doble tipo: SportsActivityLocation describe el lugar donde se
    // practica el deporte; ExerciseGym es el subtipo de LocalBusiness
    // que sí admite formalmente priceRange y openingHoursSpecification.
    "@type": ["SportsActivityLocation", "ExerciseGym"],
    name: site.name,
    ...(lang === "en" ? { description: ui.en.siteDescription } : {}),
    url: site.url,
    telephone: site.contact.phone,
    email: site.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line,
      addressLocality: site.address.city,
      postalCode: site.address.postalCode,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    priceRange: "€€",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "10:00",
        closes: "12:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Monday",
        opens: "18:00",
        closes: "22:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "18:30",
        closes: "21:00",
      },
    ],
    logo: `${site.url}/images/logo/logo-club-esgrima-torremolinos.png`,
    sameAs: [site.social.instagram],
    hasMap: site.address.mapsUrl,
    areaServed: ["Torremolinos", "Málaga"],
    image: [...galleryItems.slice(0, 3).map((g) => g.src), ...team.map((c) => c.photo.src)].map(
      (src) => `${site.url}${src}`,
    ),
    employee: team.map((c) => ({
      "@type": "Person",
      name: c.name,
      jobTitle: c.role,
      image: `${site.url}${c.photo.src}`,
      worksFor: { "@type": "Organization", name: site.name },
    })),
  };
}
