const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function Head() {
  const title = 'Clube das Leitoras — Leituras, encontros e curadoria';
  const description = 'Clube das Leitoras: leituras compartilhadas, encontros em Brasília, resenhas e atividades culturais. Junte‑se à nossa comunidade.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Clube das Leitoras',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: ['https://instagram.com/elaeasviagens']
  };

  // Prefer PNG for widest Open Graph compatibility; keep SVG in public for manual use.
  const image = `${siteUrl}/og-image.png`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <link rel="canonical" href={siteUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={siteUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </>
  );
}
