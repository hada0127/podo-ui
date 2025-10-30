import styles from './SectionHeader.module.scss';

interface SectionHeaderProps {
  title: string;
  description: string | React.ReactNode;
}

export default function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionDescription}>{description}</p>
    </div>
  );
}
