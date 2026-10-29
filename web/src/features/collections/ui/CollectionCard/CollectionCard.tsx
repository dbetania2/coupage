import React from 'react';
import Image from 'next/image';
import Label from '@/shared/ui/Label';
import type { Collection } from '../../data/collections';
import styles from './CollectionCard.module.css';

interface CollectionCardProps {
  collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={collection.image}
          alt={collection.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={styles.image}
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <Label variant="badge" className={styles.badge}>
          {collection.badge}
        </Label>
        <h3 className={styles.title}>{collection.title}</h3>
        <span className={styles.action}>
          {collection.actionText} <span className={styles.arrow}>→</span>
        </span>
      </div>
    </article>
  );
}

