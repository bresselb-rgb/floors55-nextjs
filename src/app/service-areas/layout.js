// src/app/service-areas/layout.js
const BASE_URL = 'https://www.floors55pro.com';

// Note: Root layout.js automatically appends "| Floors 55 Pro Portal"
export const metadata = {
    title: 'Portland & SW Washington Metro Trade Service Areas',
    description: 'Interactive 3D map and trade coverage across 15 Portland and SW Washington cities. On-site project measures, Lake Oswego & Portland showrooms, and local warehouse.',
    alternates: {
        canonical: `${BASE_URL}/service-areas`,
    },
    openGraph: {
        title: 'Portland & SW Washington Metro Trade Service Areas | Floors 55 Pro',
        description: 'On-site project measures, client selection showrooms, and local warehouse across 15 Portland Metro & SW Washington cities.',
        url: `${BASE_URL}/service-areas`,
        type: 'website',
    },
};

export default function ServiceAreasLayout({ children }) {
    return children;
}