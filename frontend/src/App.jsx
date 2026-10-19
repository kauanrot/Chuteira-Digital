import { useState } from 'react';
import Alunos from './pages/Alunos.jsx';
import Turmas from './pages/Turmas.jsx';
import Chamada from './pages/Chamada.jsx';

const ABAS = { alunos: Alunos, turmas: Turmas, chamada: Chamada };
const ROTULOS = { alunos: 'Alunos', turmas: 'Turmas', chamada: 'Chamada' };

export default function App() {
  const [aba, setAba] = useState('alunos');
  const Pagina = ABAS[aba];
  return (
    <div className="container">
      <h1>Chuteira Digital ⚽</h1>
      <nav>
        {Object.keys(ABAS).map((k) => (
          <button key={k} className={k === aba ? 'ativo' : ''} onClick={() => setAba(k)}>
            {ROTULOS[k]}
          </button>
        ))}
      </nav>
      <Pagina />
    </div>
  );
}
