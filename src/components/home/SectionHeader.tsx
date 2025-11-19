import styles from './SectionHeader.module.scss';

interface SectionHeaderProps {
  title: string;
  description: string | React.ReactNode;
}

export default function SectionHeader({ title, description }: SectionHeaderProps) {
  const formattedDescription = typeof description === 'string'
    ? description.split('\n').map((line, i) => (
        <span key={i}>
          {line}
          {i < description.split('\n').length - 1 && <br />}
        </span>
      ))
    : description;

  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionDescription}>{formattedDescription}</p>
    </div>
  );
}
