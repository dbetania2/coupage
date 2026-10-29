'use client';

import React, { useState } from 'react';
import Button from '@/shared/ui/Button';
import styles from './NewsletterForm.module.css';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('success');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {status === 'success' ? (
        <p className={styles.successMessage}>
          ✓ Bienvenido al Club Privado. Le hemos enviado una confirmación.
        </p>
      ) : (
        <div className={styles.inputGroup}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="SU CORREO ELECTRÓNICO AQUÍ"
            required
            className={styles.input}
            aria-label="Correo electrónico para suscripción"
          />
          <Button variant="primary" size="sm" type="submit" className={styles.submitBtn}>
            UNIRSE
          </Button>
        </div>
      )}
    </form>
  );
}

