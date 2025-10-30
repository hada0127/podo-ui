import { ReactNode } from 'react';
import styles from './FeatureCard.module.scss';

interface FeatureCardProps {
  icon: string | ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon}>
        {typeof icon === 'string' ? <i className={icon}></i> : icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
