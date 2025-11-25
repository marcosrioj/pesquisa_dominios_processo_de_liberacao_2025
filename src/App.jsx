import { useMemo } from 'react';
import { FilterPanel } from './components/FilterPanel';
import { DomainTable } from './components/DomainTable';
import { useDomainFilters } from './hooks/useDomainFilters';

function exportCsv(domains) {
  const header = 'dominio,tamanho,hifens,digitos,legibilidade,score';
  const rows = domains.map((item) =>
    [
      item.domain,
      item.length,
      item.hyphenCount,
      item.digitCount,
      item.readableRatio.toFixed(2),
      item.score.toFixed(2)
    ].join(',')
  );

  const blob = new Blob([`${header}\n${rows.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dominios-filtrados.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function Metric({ label, value, helper }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <p className="muted" style={{ margin: 0 }}>
        {label}
      </p>
      <h3 style={{ margin: 6 }}>{value}</h3>
      {helper && (
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>
          {helper}
        </p>
      )}
    </div>
  );
}

function App() {
  const { filters, updateFilter, resetFilters, domains, total, loading, error } = useDomainFilters();

  const qualitySlice = useMemo(() => domains.slice(0, 12), [domains]);

  return (
    <div className="app-shell">
      <div className="header">
        <p className="badge">Processo de liberação registro.br</p>
        <h1>Radar de domínios premium</h1>
        <p>
          Buscador avançado otimizado para a lista oficial do registro.br. Removemos comentários,
          calculamos legibilidade e ranqueamos automaticamente para você descobrir oportunidades em
          segundos.
        </p>
      </div>

      {error && <div className="card">Falha ao baixar a lista: {error}</div>}

      <FilterPanel filters={filters} onChange={updateFilter} onReset={resetFilters} />

      <div className="filters-grid">
        <Metric
          label="Domínios totais na base"
          value={loading ? 'Carregando...' : total.toLocaleString('pt-BR')}
          helper="Linhas de comentários já removidas"
        />
        <Metric
          label="Resultados após filtros"
          value={loading ? 'Carregando...' : domains.length.toLocaleString('pt-BR')}
          helper="Aplicamos ordenação por score e heurísticas"
        />
        <Metric
          label="Sugestões de alta qualidade"
          value={qualitySlice.length ? qualitySlice.map((d) => d.domain).join(', ') : '---'}
          helper="Top 12 domínios ranqueados pelo algoritmo de leitura"
        />
      </div>

      <DomainTable
        domains={domains}
        loading={loading}
        total={total}
        onExport={() => exportCsv(domains)}
      />
    </div>
  );
}

export default App;
