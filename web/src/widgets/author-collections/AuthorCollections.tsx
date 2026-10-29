import React from 'react';
import Container from '@/shared/ui/Container';
import SectionHeading from '@/shared/ui/SectionHeading';
import CollectionCard from '@/features/collections/ui/CollectionCard';
import { AUTHOR_COLLECTIONS } from '@/features/collections/data/collections';
import styles from './AuthorCollections.module.css';

export default function AuthorCollections() {
  return (
    <section id="colecciones" className={styles.section}>
      <Container size="default">
        <SectionHeading
          kicker="CURADURÍA ESPECIAL"
          title="Las Colecciones de Autor"
          subtitle="Navegue a través de selecciones rigurosas diseñadas para inspirar experiencias gastronómicas memorables."
          align="center"
        />

        <div className={styles.grid}>
          {AUTHOR_COLLECTIONS.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      </Container>
    </section>
  );
}

