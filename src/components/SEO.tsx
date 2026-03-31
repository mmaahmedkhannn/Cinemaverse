import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'video.movie' | 'video.tv_show';
  keywords?: string;
  schema?: string; // Stringified JSON-LD schema
  twitterHandle?: string;
  children?: React.ReactNode;
}

export const SEO = ({
  title = 'CinemaDiscovery | The Ultimate Movie & TV Database',
  description = 'Discover every movie and TV show ever made. Ratings, trailers, streaming availability, cast lists, and more.',
  image = 'https://cinemadiscovery.com/og-image.jpg',
  url = 'https://cinemadiscovery.com',
  type = 'website',
  keywords = 'movie database, film ratings, tv shows, streaming guide, movie trailers, IMDb alternative, best movies, top rated films, movie reviews, watch movies',
  schema,
  twitterHandle = '@cinemadiscovery',
  children,
}: SEOProps) => {
  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Social */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="CinemaDiscovery" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data (JSON-LD Schema) */}
      {schema && (
        <script type="application/ld+json">
          {schema}
        </script>
      )}
      
      {/* Additional tags like preloads */}
      {children}
    </Helmet>
  );
};

export default SEO;
