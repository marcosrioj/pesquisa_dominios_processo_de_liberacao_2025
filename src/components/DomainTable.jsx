import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const PAGE_SIZE = 200;

export function DomainTable({ domains, loading, total, onExport }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [domains]);

  const slice = useMemo(() => domains.slice(0, visibleCount), [domains, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, domains.length));
  };

  return (
    <div className="card">
      <div className="results-header">
        <div className="controls-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2>Resultados</h2>
            <p className="muted">
              {loading
                ? 'Carregando lista completa...'
                : `${domains.length.toLocaleString('pt-BR')} de ${total.toLocaleString('pt-BR')} domínios encontrados`}
            </p>
          </div>
          <div className="controls-row">
            <button className="button secondary" onClick={onExport} disabled={!domains.length} type="button">
              Exportar CSV rápido
            </button>
            <span className="badge">Renderização progressiva ({slice.length} itens)</span>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Domínio</th>
              <th>Tamanho</th>
              <th>Hífens</th>
              <th>Dígitos</th>
              <th>Legibilidade</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="6">Baixando lista em tempo real...</td>
              </tr>
            )}
            {!loading && slice.length === 0 && (
              <tr>
                <td colSpan="6">Nenhum domínio encontrado com os filtros atuais.</td>
              </tr>
            )}
            {slice.map((item) => (
              <tr key={item.domain} className="table-row">
                <td>
                  <strong>{item.domain}</strong>
                </td>
                <td>{item.length}</td>
                <td>{item.hyphenCount}</td>
                <td>{item.digitCount}</td>
                <td>{item.readableRatio.toFixed(2)}</td>
                <td>
                  <span className="tag">{item.score.toFixed(2)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibleCount < domains.length && (
        <div className="controls-row" style={{ justifyContent: 'center', marginTop: 12 }}>
          <button className="button" onClick={handleLoadMore} type="button">
            Carregar mais {Math.min(PAGE_SIZE, domains.length - visibleCount)} domínios
          </button>
        </div>
      )}
    </div>
  );
}

DomainTable.propTypes = {
  domains: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  total: PropTypes.number,
  onExport: PropTypes.func
};
