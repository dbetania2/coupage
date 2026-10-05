import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-subscribe">
          <h2 className="subscribe-title">Suscríbase al Club Privado</h2>
          <p className="subscribe-desc">
            Reciba catas guiadas exclusivas, accesos prioritarios a cosechas
            limitadas y secretos gastronómicos cada semana.
          </p>
          <div className="subscribe-form">
            <input type="email" placeholder="Su correo electrónico más selecto..." className="subscribe-input" />
            <button className="btn-primary subscribe-btn">UNIRSE</button>
          </div>
        </div>
        
        <div className="footer-links-grid">
          <div className="footer-col">
            <h4 className="footer-col-title">LA BODEGA</h4>
            <a href="#">Vinos de Autor</a>
            <a href="#">Grandes Reservas</a>
            <a href="#">Blancos de Crianza</a>
            <a href="#">Champagnes de Culto</a>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">EL ATELIER</h4>
            <a href="#">Historias de Origen</a>
            <a href="#">Maridajes Guiados</a>
            <a href="#">Catas Online</a>
            <a href="#">Club Sumiller</a>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">LA COMPAÑÍA</h4>
            <a href="#">Nuestra Causa</a>
            <a href="#">Sostenibilidad</a>
            <a href="#">Servicio Exclusivo</a>
            <a href="#">Contacto Privado</a>
          </div>
        </div>
      </div>
      
      <div className="footer-watermark">
        TU GUSTO
      </div>
      
      <div className="footer-bottom">
        <p>© 2026 Tu Gusto Gourmet S.L. Todos los derechos reservados.</p>
        <div className="footer-legal">
          <a href="#">Condiciones de Venta</a>
          <a href="#">Política de Privacidad</a>
          <a href="#">Política de Cookies</a>
        </div>
      </div>
    </footer>
  );
}
