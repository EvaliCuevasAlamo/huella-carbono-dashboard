// Contenedor base: nivel 1/2/3 de la jerarquía visual (Fase 2)
export default function Card({ level = 2, className = '', children }) {
  const cls = level === 1 ? 'l1' : level === 3 ? 'l3' : '';
  return (
    <section className={`card ${cls} ${className}`}>

      {children}
    </section>
  );
}
