// Ícones em traço único (1.6px), desenhados no mesmo grid de 20px.
function Icone({ children, tamanho = 18 }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}
const icone = (desenho) => (props) => <Icone {...props}>{desenho}</Icone>;

export const IconePainel = icone(<><path d="M3 9.2 10 3.5l7 5.7V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.2Z" /><path d="M8 17v-5h4v5" /></>);
export const IconeAlunos = icone(<><circle cx="7.5" cy="7" r="3" /><path d="M2 16.5c.7-2.8 2.8-4.3 5.5-4.3s4.8 1.5 5.5 4.3" /><path d="M13.2 4.3a3 3 0 0 1 0 5.4M15 12.6c1.5.6 2.5 1.9 3 3.9" /></>);
export const IconeTurmas = icone(<><path d="M10 4 2 7.5l8 3.5 8-3.5L10 4Z" /><path d="M5 9v4c1.3 1.3 3 2 5 2s3.700-.7 5-2V9" /></>);
export const IconeChamada = icone(<><rect x="4" y="3" width="12" height="14" rx="2" /><path d="M7.500 3v2h5V3M7.200 10.200l1.800 1.800 3.800-3.800" /></>);
export const IconeUsuarios = icone(<><circle cx="10" cy="7" r="3.200" /><path d="M3.500 17c.8-3.200 3.300-4.800 6.500-4.800s5.700 1.600 6.500 4.800" /></>);
export const IconeProfessor = icone(<><circle cx="10" cy="6.500" r="3" /><path d="M4 17c.700-3 3-4.700 6-4.700s5.300 1.700 6 4.700" /></>);
export const IconeTendencia = icone(<><path d="m3 14 4.500-4.500 3 3L17 6" /><path d="M12.500 6H17v4.500" /></>);
export const IconeCalendario = icone(<><rect x="3" y="4.500" width="14" height="12.500" rx="2" /><path d="M3 8.500h14M7 3v3M13 3v3" /></>);
export const IconeSair = icone(<path d="M8 3H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3M13 6.500l3.500 3.500-3.500 3.500M16.500 10H8" />);
export const IconeBusca = icone(<><circle cx="9" cy="9" r="5.500" /><path d="m13.200 13.200 3.800 3.800" /></>);
export const IconeMais = icone(<path d="M10 4v12M4 10h12" />);
export const IconeFechar = icone(<path d="m5 5 10 10M15 5 5 15" />);
export const IconeSeta = icone(<path d="m7.500 4.500 5.500 5.500-5.500 5.500" />);
export const IconeSetaBaixo = icone(<path d="m5 7.500 5 5 5-5" />);
export const IconeRecolher = icone(<path d="m10 5-5 5 5 5M15.500 5l-5 5 5 5" />);
export const IconeSol = icone(<><circle cx="10" cy="10" r="3.500" /><path d="M10 2v1.800M10 16.200V18M2 10h1.800M16.200 10H18M4.300 4.300l1.300 1.300M14.400 14.400l1.300 1.300M4.300 15.700l1.300-1.300M14.400 5.600l1.300-1.300" /></>);
export const IconeLua = icone(<path d="M16.500 11.500A7 7 0 0 1 8.500 3.500a7 7 0 1 0 8 8Z" />);
export const IconeSino = icone(<><path d="M5 8a5 5 0 0 1 10 0c0 4 1.500 5 1.500 5h-13S5 12 5 8Z" /><path d="M8.300 16a1.800 1.800 0 0 0 3.400 0" /></>);
export const IconeEditar = icone(<><path d="m12.500 4 3.500 3.500L7.500 16H4v-3.500L12.500 4Z" /><path d="m11 5.500 3.500 3.500" /></>);
export const IconeEmail = icone(<><rect x="2.500" y="4.500" width="15" height="11" rx="2" /><path d="m3 6 7 5 7-5" /></>);
export const IconeCadeado = icone(<><rect x="4" y="9" width="12" height="8" rx="2" /><path d="M7 9V6.500a3 3 0 0 1 6 0V9" /></>);
export const IconeOlho = icone(<><path d="M2 10s3-5.500 8-5.500S18 10 18 10s-3 5.500-8 5.500S2 10 2 10Z" /><circle cx="10" cy="10" r="2.300" /></>);
export const IconeOlhoFechado = icone(<><path d="M3 3l14 14M8.300 5c.500-.100 1.100-.200 1.700-.200 5 0 8 5.200 8 5.200s-.900 1.600-2.500 3M12 14.900c-.600.200-1.300.300-2 .300-5 0-8-5.200-8-5.200s1-1.800 2.900-3.300" /></>);
export const IconeCheck = icone(<path d="m4.500 10.500 3.500 3.500 7.500-8" />);
export const IconeLista = icone(<path d="M7 5.500h10M7 10h10M7 14.500h10M3.500 5.500h.01M3.500 10h.01M3.500 14.500h.01" />);

// Marca: chuteira de perfil, com as travas na sola.
export function Logo({ tamanho = 30 }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 32 32" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 19.500c0-1.200.800-2.200 2-2.500l5-1.300c1.600-.400 3-1.300 4-2.600l3.200-4.300c.500-.700 1.500-.900 2.200-.400l1.400 1c.500.300.700.900.600 1.500l-.500 2.200c-.200 1 .300 2 1.200 2.500l4.300 2.200c1.600.800 2.600 2.400 2.600 4.200v.5c0 .800-.700 1.500-1.500 1.500H5c-1.100 0-2-.900-2-2v-2.500Z" />
      <path d="M13.500 14 16 16.500M16 11l2.500 2.500M7 27v-3M13 27v-3M19 27v-3M25 27v-3" />
    </svg>
  );
}
