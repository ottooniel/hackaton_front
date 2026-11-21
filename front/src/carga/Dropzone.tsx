import { useState, type DragEvent } from 'react';
import css from './Dropzone.module.css';

interface Props {
  onArchivos: (archivos: File[]) => void;
  ocupado?: boolean;
}

// <label> + input oculto pero enfocable: clic, teclado (Enter/Espacio sobre el input) y arrastre.
export function Dropzone({ onArchivos, ocupado = false }: Props) {
  const [encima, setEncima] = useState(false);

  const soltar = (e: DragEvent) => {
    e.preventDefault();
    setEncima(false);
    const files = [...e.dataTransfer.files];
    if (files.length && !ocupado) onArchivos(files);
  };

  return (
    <label
      className={`${css.drop} ${encima ? css.encima : ''}`}
      onDragOver={(e) => { e.preventDefault(); setEncima(true); }}
      onDragLeave={() => setEncima(false)}
      onDrop={soltar}
      aria-busy={ocupado}
    >
      <input
        className="vh"
        type="file"
        multiple
        accept=".xlsx,.xls"
        disabled={ocupado}
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = '';
          if (files.length) onArchivos(files);
        }}
      />
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" stroke="var(--azul)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="10" y="22" width="34" height="42" rx="4" fill="#fff" />
        <rect x="20" y="14" width="34" height="42" rx="4" fill="#fff" />
        <path d="M28 26h18M28 34h18M28 42h10" />
        <circle cx="54" cy="50" r="14" fill="var(--amarillo)" stroke="var(--tinta)" />
        <path d="M54 57V44M48 49l6-6 6 6" stroke="var(--tinta)" />
      </svg>
      <span className={css.titulo}>{ocupado ? 'Conectando con el motor de cálculo…' : 'Arrastra aquí tus archivos'}</span>
      <span className={css.sub}>o haz clic para elegirlos desde tu computadora</span>
    </label>
  );
}
