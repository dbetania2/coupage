import React from 'react';
import Hero from '@/widgets/hero';
import FeaturedProducts from '@/widgets/featured-products';
import AuthorCollections from '@/widgets/author-collections';
import BrandStory from '@/widgets/brand-story';
import Benefits from '@/widgets/benefits';

export default function LandingPage() {
  return (
    <>
      {/* 1. Hero con imagen de cava, titular editorial y dos CTAs */}
      <Hero />

      {/* 2. Los Más Solicitados de la Semana (Carrusel y tarjetas de productos) */}
      <FeaturedProducts />

      {/* 3. Las Colecciones de Autor (Tres tarjetas editoriales verticales) */}
      <AuthorCollections />

      {/* 4. Historia de la marca (Composición asimétrica con narrativa y mosaico) */}
      <BrandStory />

      {/* 5. Franja de Beneficios (Envío climatizado, garantía de atelier, packaging premium) */}
      <Benefits />
    </>
  );
}

