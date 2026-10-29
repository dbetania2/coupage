import React from 'react';
import Image from 'next/image';
import Container from '@/shared/ui/Container';
import Label from '@/shared/ui/Label';
import styles from './BrandStory.module.css';

export default function BrandStory() {
  return (
    <section id="historia" className={styles.section}>
      <Container size="default">
        <div className={styles.layout}>
          {/* Columna izquierda: Narrativa editorial */}
          <div className={styles.textColumn}>
            <Label variant="kicker" className={styles.kicker}>
              EL ORIGEN
            </Label>

            <h2 className={styles.title}>
              Donde el Tiempo y la Tierra Conspiran
            </h2>

            <div className={styles.paragraphs}>
              <p>
                Nacida de una devoción intransigente por las joyas gastronómicas olvidadas,
                Tu Gusto Gourmet no es solo una bodega; es un atelier de guarda donde cada
                vino, queso y pieza de charcutería reposa con paciencia hasta alcanzar su
                máxima expresión sensorial.
              </p>
              <p>
                Trabajamos mano a mano con viticultores de cuarta generación y maestros afinadores
                que desafían la inmediatez comercial, honrando el legado de la tierra y el
                paso pausado de los años en roble.
              </p>
            </div>

            {/* Sello y firma del atelier */}
            <div className={styles.signatureBadge}>
              <div className={styles.badgeIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="8" r="6"></circle>
                  <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
                </svg>
              </div>
              <div className={styles.badgeText}>
                <span className={styles.founderName}>Atelier de Selección</span>
                <span className={styles.founderRole}>Certificación de Origen y Calidad</span>
              </div>
            </div>
          </div>

          {/* Columna derecha: Mosaico editorial de 3 fotos */}
          <div className={styles.mosaicColumn}>
            <div className={styles.mainImageWrapper}>
              <Image
                src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop"
                alt="Maestro bodeguero en cava de barricas"
                fill
                sizes="(max-width: 900px) 100vw, 30vw"
                className={styles.image}
              />
            </div>

            <div className={styles.sideImages}>
              <div className={styles.topSideImageWrapper}>
                <Image
                  src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=800&auto=format&fit=crop"
                  alt="Viñedos al atardecer"
                  fill
                  sizes="(max-width: 900px) 100vw, 25vw"
                  className={styles.image}
                />
              </div>

              <div className={styles.bottomSideImageWrapper}>
                <Image
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop"
                  alt="Mesa de cata gourmet"
                  fill
                  sizes="(max-width: 900px) 100vw, 25vw"
                  className={styles.image}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

