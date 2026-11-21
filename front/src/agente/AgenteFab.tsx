import type { Ref } from 'react';
import styles from './AgenteFab.module.css';

interface Props { onClick: () => void; expandido: boolean; ref?: Ref<HTMLButtonElement> }

export function AgenteFab({ onClick, expandido, ref }: Props) {
  return (
    <button ref={ref} type="button" className={styles.fab} onClick={onClick} aria-label="Pregúntale a tus números" aria-expanded={expandido}>
      <span className={styles.etiqueta} aria-hidden="true">Pregúntale a tus números</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 2.2 13.7 8.6 20.2 10.2 13.7 11.8 12 18.2 10.3 11.8 3.8 10.2 10.3 8.6 12 2.2zM18.2 14.2 19 16.6 21.4 17.4 19 18.2 18.2 20.6 17.4 18.2 15 17.4 17.4 16.6 18.2 14.2z" />
      </svg>
    </button>
  );
}
