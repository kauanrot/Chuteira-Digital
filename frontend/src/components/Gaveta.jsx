import { useEffect, useRef, useState } from 'react';
import { IconeFechar } from './Icones.jsx';

const SAIDA_MS = 200;

// Painel lateral para formulários. Entra devagar o bastante para ser lido
// (320ms, curva de gaveta) e sai rápido (200ms), porque fechar é o sistema
// respondendo, não o usuário decidindo.
export default function Gaveta({ aberta, aoFechar, titulo, descricao, children, rodape, onSubmit }) {
  const [montada, setMontada] = useState(aberta);
  const [estado, setEstado] = useState('entrando');
  const painel = useRef(null);
  const antesDeAbrir = useRef(null);

  useEffect(() => {
    if (aberta) {
      antesDeAbrir.current = document.activeElement;
      setMontada(true);
      setEstado('entrando');
      // Dois quadros: o primeiro pinta fora da tela, o segundo dispara a transição.
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setEstado('aberta')));
      return () => cancelAnimationFrame(id);
    }
    if (montada) {
      setEstado('fechando');
      const t = setTimeout(() => {
        setMontada(false);
        antesDeAbrir.current?.focus?.();
      }, SAIDA_MS);
      return () => clearTimeout(t);
    }
  }, [aberta]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (estado !== 'aberta') return;
    painel.current?.querySelector('input, select, textarea')?.focus({ preventScroll: true });
  }, [estado]);

  useEffect(() => {
    if (!montada) return;
    const tecla = (e) => { if (e.key === 'Escape') aoFechar(); };
    document.addEventListener('keydown', tecla);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tecla);
      document.body.style.overflow = overflow;
    };
  }, [montada, aoFechar]);

  if (!montada) return null;

  return (
    <>
      <div className="gaveta-fundo" data-estado={estado} onClick={aoFechar} aria-hidden="true" />
      <form
        ref={painel}
        className="gaveta"
        data-estado={estado}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gaveta-titulo"
        onSubmit={onSubmit}
        noValidate
      >
        <div className="gaveta-cab">
          <div>
            <h2 id="gaveta-titulo">{titulo}</h2>
            {descricao && <p>{descricao}</p>}
          </div>
          <button type="button" className="icone-btn" onClick={aoFechar} aria-label="Fechar">
            <IconeFechar />
          </button>
        </div>
        <div className="gaveta-corpo">{children}</div>
        {rodape && <div className="gaveta-rodape">{rodape}</div>}
      </form>
    </>
  );
}
