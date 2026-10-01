import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import type { EnrichedInventar } from '@/types/enriched';
import { useMemo, useState } from 'react';
import { tx, appLabel } from '@/i18n';
import { useClock, gruss, namen } from '@/lib/polish';
import { formatCurrency, lookupKey } from '@/lib/formatters';
import { LOOKUP_OPTIONS } from '@/types/app';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { HeroBanner } from '@/components/HeroBanner';
import { WorkList } from '@/components/WorkList';
import {
  ChartWidget,
  type ChartRow,
  type ChartSegment,
} from '@/components/widgets/ChartWidget';
import {
  IconAlertTriangle,
  IconPackage,
  IconTool,
  IconCategory,
  IconPlus,
  IconAlertCircle,
} from '@tabler/icons-react';

type InvRow = ChartRow<EnrichedInventar>;

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { kategorien, inventar, fetchAll } = data;
  const crud = useEntityCrud(data);
  const enrichedInventar = crud.enriched.inventar;

  const clock = useClock();

  // Filter: Zustand-Segment (chart filtert die Artikelliste)
  const [zustandSel, setZustandSel] = useState<ChartSegment<EnrichedInventar> | null>(null);

  // Lookup options (INSIDE body — locale-aware)
  const zustandOptions = LOOKUP_OPTIONS['inventar']?.['zustand'] ?? [];

  // KPI-Derivation
  const defekte = useMemo(
    () => enrichedInventar.filter(r => lookupKey(r.fields.zustand) === 'defekt'),
    [enrichedInventar],
  );
  const unterMindest = useMemo(
    () =>
      enrichedInventar.filter(
        r =>
          r.fields.mindestbestand != null &&
          (r.fields.menge ?? 0) < r.fields.mindestbestand,
      ),
    [enrichedInventar],
  );

  // Chart rows
  const rows = useMemo<InvRow[]>(
    () => enrichedInventar.map(r => ({ id: `inventar:${r.record_id}`, data: r })),
    [enrichedInventar],
  );

  // Gefilterte Artikelliste (Zustand-Chart-Filter)
  const gefilterteArtikel = useMemo(
    () => enrichedInventar.filter(r => !zustandSel || zustandSel.test({ id: `inventar:${r.record_id}`, data: r })),
    [enrichedInventar, zustandSel],
  );

  // Unter-Mindestbestand WorkList items
  const mindestItems = useMemo(
    () =>
      unterMindest.slice(0, 8).map(r => ({
        id: r.record_id,
        title: r.fields.artikelname ?? tx('Unbekannter Artikel'),
        secondLine: (
          <>
            <span className="font-medium text-amber-600">
              {tx('Bestand')}: {r.fields.menge ?? 0} / {tx('Min')}: {r.fields.mindestbestand}
            </span>
            <span className="text-muted-foreground"> · {r.kategorieName || appLabel('kategorien')}</span>
          </>
        ),
        action: {
          label: tx('Bearbeiten'),
          onClick: () => crud.inventar.openEdit(r),
        },
      })),
    [unterMindest, crud.inventar],
  );

  // Kontext-Satz
  const contextLine = useMemo(() => {
    if (enrichedInventar.length === 0) return tx('Noch keine Artikel im Inventar.');
    if (defekte.length > 0) {
      return tx`${namen(defekte.map(r => r.fields.artikelname ?? ''))} als defekt markiert.`;
    }
    if (unterMindest.length > 0) {
      return tx`${unterMindest.length} Artikel unter Mindestbestand — bitte nachbestellen.`;
    }
    return tx`${enrichedInventar.length} Artikel in ${kategorien.length} Kategorien — alles im grünen Bereich.`;
  }, [enrichedInventar, defekte, unterMindest, kategorien]);

  // Hero: Defekte Artikel als Signal
  const heroBanner =
    defekte.length > 0 ? (
      <HeroBanner
        icon={<IconAlertTriangle size={18} />}
        action={{
          label: tx('Artikel prüfen'),
          onClick: () => crud.inventar.openDetail(defekte[0]),
        }}
      >
        <b>{namen(defekte.map(r => r.fields.artikelname ?? ''))}</b>
        {' '}{tx('als defekt markiert — bitte prüfen und ggf. austauschen.')}
      </HeroBanner>
    ) : undefined;

  // Leerer Zustand
  if (enrichedInventar.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{gruss(clock)}</h1>
          <p className="text-muted-foreground mt-1">{tx('Richte dein Werkstatt-Inventar ein.')}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-[27px] bg-card shadow-lg">
          <IconPackage size={48} className="text-muted-foreground" />
          <p className="text-muted-foreground text-sm">{tx('Noch keine Artikel erfasst — leg jetzt los.')}</p>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            onClick={() => crud.inventar.openCreate({})}
          >
            <IconPlus size={16} />
            {tx('Ersten Artikel aufnehmen')}
          </button>
        </div>
        {crud.surfaces}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seitenkopf */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{gruss(clock)}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{contextLine}</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
          onClick={() => crud.inventar.openCreate({})}
        >
          <IconPlus size={16} />
          {tx('Neuer Artikel')}
        </button>
      </div>

      <DashboardGrid
        variant="wide"
        hero={heroBanner}
        kpis={
          <StatStrip>
            <StatStripItem
              title={appLabel('inventar')}
              value={enrichedInventar.length}
              icon={<IconPackage size={18} />}
            />
            <StatStripItem
              title={appLabel('kategorien')}
              value={kategorien.length}
              icon={<IconCategory size={18} />}
            />
            <StatStripItem
              title={tx('Defekt')}
              value={defekte.length}
              icon={<IconTool size={18} />}
              tone={defekte.length > 0 ? 'destructive' : 'default'}
              onClick={() =>
                setZustandSel(
                  zustandSel?.key === 'defekt'
                    ? null
                    : ({
                        key: 'defekt',
                        label: zustandOptions.find(o => o.key === 'defekt')?.label ?? tx('Defekt'),
                        rowIds: defekte.map(r => `inventar:${r.record_id}`),
                        test: (row: InvRow) => lookupKey(row.data.fields.zustand) === 'defekt',
                      } as ChartSegment<EnrichedInventar>),
                )
              }
              active={zustandSel?.key === 'defekt'}
            />
            <StatStripItem
              title={tx('Unter Mindestbestand')}
              value={unterMindest.length}
              icon={<IconAlertCircle size={18} />}
              tone={unterMindest.length > 0 ? 'warning' : 'default'}
            />
          </StatStrip>
        }
        primary={
          <div className="space-y-4">
            {/* Zustand-Filterchart */}
            <ChartWidget<EnrichedInventar>
              title={tx('Artikel nach Zustand')}
              rows={rows}
              dimension={{ kind: 'category', accessor: r => r.data.fields.zustand, label: tx('Zustand'), mark: 'donut' }}
              interaction={{
                mode: 'filter',
                selectedKey: zustandSel?.key ?? null,
                onSelect: setZustandSel,
              }}
            />

            {/* Gefilterte Artikelliste */}
            <div className="rounded-[27px] bg-card shadow-lg overflow-hidden">
              <div className="px-6 pt-5 pb-3 flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  {zustandSel
                    ? tx`${appLabel('inventar')} — ${zustandSel.label}`
                    : appLabel('inventar')}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {gefilterteArtikel.length} {gefilterteArtikel.length === 1 ? tx('Artikel') : tx('Artikel')}
                </span>
              </div>

              {/* Desktop-Tabelle */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-2 text-left font-medium text-muted-foreground">{tx('Artikel')}</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">{tx('Kategorie')}</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">{tx('Menge')}</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">{tx('Zustand')}</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">{tx('Lagerort')}</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">{tx('Preis')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gefilterteArtikel.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground text-sm">
                          {tx('Keine Artikel gefunden.')}
                        </td>
                      </tr>
                    ) : (
                      gefilterteArtikel.map(r => {
                        const isUnter =
                          r.fields.mindestbestand != null &&
                          (r.fields.menge ?? 0) < r.fields.mindestbestand;
                        const zustandKey = lookupKey(r.fields.zustand);
                        const zustandColor =
                          zustandKey === 'defekt'
                            ? 'text-destructive'
                            : zustandKey === 'gebraucht'
                              ? 'text-amber-600'
                              : 'text-emerald-600';
                        return (
                          <tr
                            key={r.record_id}
                            className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                            onClick={() => crud.inventar.openDetail(r)}
                          >
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2 min-w-0">
                                {isUnter && (
                                  <IconAlertTriangle size={14} className="text-amber-500 shrink-0" />
                                )}
                                <span className="font-medium truncate">{r.fields.artikelname}</span>
                                {r.fields.artikelnummer && (
                                  <span className="text-xs text-muted-foreground shrink-0">#{r.fields.artikelnummer}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground truncate max-w-[140px]">
                              {r.kategorieName || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={isUnter ? 'text-amber-600 font-medium' : ''}>
                                {r.fields.menge ?? '—'}
                              </span>
                              {r.fields.einheit && (
                                <span className="text-muted-foreground ml-1 text-xs">
                                  {r.fields.einheit.label}
                                </span>
                              )}
                              {isUnter && (
                                <span className="text-xs text-amber-500 ml-1">
                                  {tx`(Min. ${r.fields.mindestbestand})`}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium ${zustandColor}`}>
                                {r.fields.zustand?.label ?? '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs truncate max-w-[120px]">
                              {r.fields.lagerort || '—'}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                              {r.fields.anschaffungspreis != null
                                ? formatCurrency(r.fields.anschaffungspreis)
                                : '—'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile-Karten */}
              <div className="md:hidden divide-y divide-border">
                {gefilterteArtikel.length === 0 ? (
                  <p className="px-6 py-8 text-center text-muted-foreground text-sm">
                    {tx('Keine Artikel gefunden.')}
                  </p>
                ) : (
                  gefilterteArtikel.map(r => {
                    const isUnter =
                      r.fields.mindestbestand != null &&
                      (r.fields.menge ?? 0) < r.fields.mindestbestand;
                    const zustandKey = lookupKey(r.fields.zustand);
                    const zustandColor =
                      zustandKey === 'defekt'
                        ? 'text-destructive'
                        : zustandKey === 'gebraucht'
                          ? 'text-amber-600'
                          : 'text-emerald-600';
                    return (
                      <div
                        key={r.record_id}
                        className="px-4 py-3 cursor-pointer active:bg-muted/40"
                        onClick={() => crud.inventar.openDetail(r)}
                      >
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {isUnter && (
                                <IconAlertTriangle size={13} className="text-amber-500 shrink-0" />
                              )}
                              <span className="font-medium text-sm truncate">{r.fields.artikelname}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {r.kategorieName || appLabel('kategorien')}
                              {r.fields.lagerort && ` · ${r.fields.lagerort}`}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`text-xs font-medium ${zustandColor}`}>
                              {r.fields.zustand?.label ?? '—'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {r.fields.menge ?? '—'}
                              {r.fields.einheit ? ` ${r.fields.einheit.label}` : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        }
        aside={
          <>
            <WorkList
              title={tx('Unter Mindestbestand')}
              items={mindestItems}
              onItemClick={id => {
                const r = enrichedInventar.find(x => x.record_id === id);
                if (r) crud.inventar.openDetail(r);
              }}
              empty={{
                text: tx('Alle Bestände über dem Minimum — Lager gut versorgt.'),
                action: {
                  label: tx('Artikel hinzufügen'),
                  onClick: () => crud.inventar.openCreate({}),
                },
              }}
            />
            <ChartWidget<EnrichedInventar>
              title={tx('Artikel nach Kategorie')}
              rows={rows}
              dimension={{ kind: 'category', accessor: r => r.data.kategorieName || null, label: tx('Kategorie') }}
            />
          </>
        }
      />

      {crud.surfaces}
    </div>
  );
}
