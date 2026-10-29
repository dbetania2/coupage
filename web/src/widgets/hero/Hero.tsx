'use client';

import React from 'react';
import Link from 'next/link';
import Container from '@/shared/ui/Container';
import Button from '@/shared/ui/Button';
import Label from '@/shared/ui/Label';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      {/* Fondo con imagen de bodega y gradiente oscuro de iluminación */}
      <div className={styles.heroBackground} />
      <div className={styles.heroOverlay} />

      <Container size="default" className={styles.container}>
        <div className={styles.content}>
          <Label variant="kicker" className={styles.kicker}>
            SELECCIÓN DE OBRAS DE AUTOR
          </Label>

          <h1 className={styles.title}>
            El arte del buen gusto<br />
            embotellado y curado
          </h1>

          <p className={styles.description}>
            Vinos de autor, quesos afinados bajo guarda y piezas exclusivas curadas para paladares
            que buscan la cumbre gastronómica sin concesiones.
          </p>

          <div className={styles.actions}>
            <Link href="/catalogo" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="md">
                EXPLORAR CATÁLOGO <span className={styles.arrow}>→</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="md"
              onClick={() => {
                document.getElementById('historia')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              NUESTRA FILOSOFÍA
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
