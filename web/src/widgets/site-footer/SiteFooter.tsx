import React from 'react';
import Link from 'next/link';
import Container from '@/shared/ui/Container';
import NewsletterForm from '@/features/newsletter/ui/NewsletterForm';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container size="default">
        {/* Fila principal: Suscripción a la izquierda, Links a la derecha */}
        <div className={styles.topSection}>
          <div className={styles.newsletterBlock}>
            <h3 className={styles.newsletterTitle}>Suscríbase al Club Privado</h3>
            <p className={styles.newsletterDesc}>
              ACCESO PRIORITARIO A EDICIONES LIMITADAS, CATAS PRIVADAS Y ASIGNACIONES DE BODEGAS EMBLEMÁTICAS.
            </p>
            <NewsletterForm />
          </div>

          <div className={styles.linksNav}>
            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>BODEGA</h4>
              <ul className={styles.linkList}>
                <li><Link href="#bodega">Grandes Reservas</Link></li>
                <li><Link href="#bodega">Vinos de Terruño</Link></li>
                <li><Link href="#bodega">Blancos de Guarda</Link></li>
                <li><Link href="#bodega">Champagnes de Autor</Link></li>
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>ATELIER</h4>
              <ul className={styles.linkList}>
                <li><Link href="#atelier">Afinado de Quesos</Link></li>
                <li><Link href="#atelier">Ibéricos de Bellota</Link></li>
                <li><Link href="#atelier">Cofres Gourmet</Link></li>
                <li><Link href="#atelier">Club Selección</Link></li>
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4 className={styles.columnTitle}>LA MAISON</h4>
              <ul className={styles.linkList}>
                <li><Link href="#historia">Nuestra Historia</Link></li>
                <li><Link href="#servicios">Atelier & Cavas</Link></li>
                <li><Link href="/contacto">Servicio al Cliente</Link></li>
                <li><Link href="/contacto">Contacto Privado</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Marca de agua tipográfica gigante de la referencia "TU GUSTO" */}
        <div className={styles.watermarkWrapper}>
          <span className={styles.watermark}>TU GUSTO</span>
        </div>

        {/* Barra legal final */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Tu Gusto Gourmet. Todos los derechos reservados.
          </p>
          <div className={styles.legalLinks}>
            <Link href="/aviso-legal">Aviso Legal</Link>
            <Link href="/privacidad">Política de Privacidad</Link>
            <Link href="/cookies">Gestión de Cookies</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

