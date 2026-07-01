const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function Head() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Clube das Leitoras',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: ['https://instagram.com/elaeasviagens'],
  };

  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="theme-color" content="#B04D4A" />
      <meta name="color-scheme" content="light" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Clube das Leitoras" />
      <meta name="format-detection" content="telephone=no" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </>
  );
}
