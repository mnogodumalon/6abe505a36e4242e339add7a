import type { Inventar, Kategorien } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';

export interface InventarDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Inventar;
  /** N:1-Ziel „Kategorien": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  kategorienList: Kategorien[];
  /** Klick auf die Kategorien-Relation → overlay.push auf dessen Detail. */
  onOpenKategorien?: (record: Kategorien) => void;
}

export function InventarDetails({
  record,
  kategorienList,
  onOpenKategorien,
}: InventarDetailsProps) {
  const kategorieTarget = kategorienList.find(r => r.record_id === extractRecordId(record.fields.kategorie));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('inventar', 'artikelname')} value={record.fields.artikelname} format="text" />
        <RecordField label={fieldLabel('inventar', 'artikelnummer')} value={record.fields.artikelnummer} format="text" />
        <RecordField label={fieldLabel('inventar', 'seriennummer')} value={record.fields.seriennummer} format="text" />
        <RecordField label={fieldLabel('inventar', 'menge')} value={record.fields.menge} format="text" />
        <RecordField label={fieldLabel('inventar', 'einheit')} value={record.fields.einheit} format="pill" />
        <RecordField label={fieldLabel('inventar', 'mindestbestand')} value={record.fields.mindestbestand} format="text" />
        <RecordField label={fieldLabel('inventar', 'lagerort')} value={record.fields.lagerort} format="text" />
        <RecordField label={fieldLabel('inventar', 'zustand')} value={record.fields.zustand} format="pill" />
        <RecordField label={fieldLabel('inventar', 'anschaffungsdatum')} value={record.fields.anschaffungsdatum} format="date" />
        <RecordField label={fieldLabel('inventar', 'anschaffungspreis')} value={record.fields.anschaffungspreis} format="text" />
        <RecordField label={fieldLabel('inventar', 'lieferant')} value={record.fields.lieferant} format="text" />
        <RecordField label={fieldLabel('inventar', 'foto')} className="md:col-span-2">
          {record.fields.foto ? (
            <MediaThumbnail src={record.fields.foto as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('inventar', 'bemerkungen')} value={record.fields.bemerkungen} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('inventar', 'kategorie')}
          name={kategorieTarget?.fields.kategoriename ?? '—'}
          meta={undefined}
          onClick={kategorieTarget && onOpenKategorien ? () => onOpenKategorien!(kategorieTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.INVENTAR} recordId={record.record_id} />
    </>
  );
}
