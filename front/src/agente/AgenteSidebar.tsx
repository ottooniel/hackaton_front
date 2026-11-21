import { useEffect, useRef, useState, type FormEvent } from 'react';
import { RESPUESTAS_AGENTE } from '../shared/mock';
import type { RespuestaAgente } from '../shared/types';
import { useApp } from '../state/useApp';
import { Boton } from '../ui';
import { IcoCerrar } from '../ui/iconos';
import styles from './AgenteSidebar.module.css';
import { datosDe, type DatosGrafica } from './datos';
import { pedirRespuesta } from './detectarGrafica';
import { GraficaRespuesta } from './GraficaRespuesta';

type Turno =
  | { id: number; rol: 'persona'; texto: string }
  | { id: number; rol: 'agente'; pensando: true }
  | { id: number; rol: 'agente'; pensando: false; respuesta: RespuestaAgente; datos: DatosGrafica; specAbierta: boolean };

let siguiente = 1;

export function AgenteSidebar({ onCerrar }: { onCerrar: () => void }) {
  const { publicable, ir } = useApp();
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const [texto, setTexto] = useState('');
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => { cerrarRef.current?.focus(); }, []);

  async function enviar(pregunta: string) {
    const limpio = pregunta.trim();
    if (!limpio || ocupado || !publicable) return;
    const idPersona = siguiente++;
    const idAgente = siguiente++;
    setTexto('');
    setOcupado(true);
    setTurnos((prev) => [
      ...prev,
      { id: idPersona, rol: 'persona', texto: limpio },
      { id: idAgente, rol: 'agente', pensando: true },
    ]);
    const respuesta = await pedirRespuesta(limpio);
    const datos = await datosDe(respuesta, limpio);
    const visible = datos.tipo === 'alerta' ? { ...respuesta, texto: datos.texto } : respuesta;
    setTurnos((prev) => prev.map((t) => (
      t.id === idAgente
        ? { id: idAgente, rol: 'agente', pensando: false, respuesta: visible, datos, specAbierta: false }
        : t
    )));
    setOcupado(false);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void enviar(texto);
  }

  return (
    <aside className={styles.panel} role="dialog" aria-label="Pregúntale a tus números">
      <header className={styles.cabecera}>
        <div>
          <h2>Pregúntale a tus números</h2>
          <p>Los valores salen del motor de cálculo</p>
        </div>
        <button ref={cerrarRef} type="button" className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar">
          <IcoCerrar tam={22} />
        </button>
      </header>

      {!publicable ? (
        <div className={styles.bloqueo}>
          <p className={styles.bloqueoTitulo}>Todavía bloqueado</p>
          <p>Resuelve los errores bloqueantes para poder preguntar.</p>
          <p>El agente solo trabaja con cifras publicables.</p>
          <Boton className={styles.ir} variante="amarillo" onClick={() => { ir(2); onCerrar(); }}>
            Ir a revisar
          </Boton>
        </div>
      ) : (
        <>
          <div className={styles.cuerpo}>
            <p className={styles.sugeridas}>Preguntas sugeridas</p>
            <div className={styles.chips}>
              {RESPUESTAS_AGENTE.map((r) => (
                <button key={r.pregunta} type="button" className={styles.chip} onClick={() => void enviar(r.pregunta)}>
                  {r.pregunta}
                </button>
              ))}
            </div>
            <div className={styles.hilo} aria-live="polite">
              {turnos.map((t) => {
                if (t.rol === 'persona') {
                  return <p key={t.id} className={styles.persona}>{t.texto}</p>;
                }
                if (t.pensando) {
                  return (
                    <p key={t.id} className={styles.pensando}>
                      <span className={styles.puntos} aria-hidden="true"><i /><i /><i /></span>
                      Armando la gráfica…
                    </p>
                  );
                }
                return (
                  <article key={t.id} className={styles.respuesta}>
                    {t.datos.tipo !== 'alerta' && <p>{t.respuesta.texto}</p>}
                    <GraficaRespuesta datos={t.datos} />
                    <button
                      type="button"
                      className={styles.specBtn}
                      onClick={() => setTurnos((prev) => prev.map((item) => (
                        item.id === t.id && item.rol === 'agente' && !item.pensando
                          ? { ...item, specAbierta: !item.specAbierta }
                          : item
                      )))}
                    >
                      Ver qué le pidió el agente al motor
                    </button>
                    {t.specAbierta && (
                      <pre className={styles.spec}>{JSON.stringify(t.respuesta.spec, null, 2)}</pre>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
          <form className={styles.form} onSubmit={onSubmit}>
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe tu pregunta"
              aria-label="Escribe tu pregunta"
            />
            <Boton type="submit" variante="amarillo" tam="s" disabled={ocupado || !texto.trim()}>
              Preguntar
            </Boton>
          </form>
        </>
      )}
    </aside>
  );
}
