/**
 * Neuer Artikel — 3-Schritt-Wizard.
 * Steps: 1) Kategorie wählen → 2) Artikeldaten eingeben → 3) Zustand und Menge → 4) Prüfen & anlegen.
 * Reads: kategorien. Writes: inventar (createInventarEntry).
 * Composes: IntentWizardShell, WizardStep, EntitySelectStep, Bound, ChoiceGroup, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { useStepForm, useJourneySubmit, useRecordSearch, fieldText } from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { tx } from '@/i18n';

export default function NeuerArtikelPage() {
  const [step, setStep] = useState(1);

  const kategorien = useRecordSearch(servicePort, 'kategorien', {
    searchFields: ['kategoriename'],
    toItem: k => ({
      id: k.id,
      title: fieldText(k, 'kategoriename'),
      subtitle: fieldText(k, 'beschreibung') || undefined,
    }),
  });

  const artikel = useStepForm('inventar', {
    steps: {
      kategorie: 1,
      artikelname: 2,
      artikelnummer: 2,
      seriennummer: 2,
      lagerort: 2,
      lieferant: 2,
      anschaffungsdatum: 2,
      anschaffungspreis: 2,
      bemerkungen: 2,
      zustand: 3,
      menge: 3,
      einheit: 3,
      mindestbestand: 3,
    },
  });

  const submit = useJourneySubmit(servicePort, [
    { key: 'inventar', entity: 'inventar', form: artikel, primary: true },
  ], { draftKey: 'neuer-artikel' });

  return (
    <IntentWizardShell
      title={tx('Neuer Artikel')}
      currentStep={step}
      onStepChange={setStep}
      forms={[artikel]}
      draftKey="neuer-artikel"
      intro={{
        description: tx('Einen neuen Inventarartikel anlegen und ins Inventar aufnehmen.'),
        needs: [tx('Kategorie'), tx('Artikelname'), tx('Zustand und Menge')],
      }}
    >
      <WizardStep
        label={tx('Kategorie')}
        description={tx('Wähle die Kategorie, zu der dieser Artikel gehört.')}
      >
        <EntitySelectStep
          {...kategorien.select}
          selectedId={artikel.get('kategorie') as string | null}
          onSelect={id => {
            artikel.set('kategorie', id, kategorien.labelOf(id));
            setStep(2);
          }}
          create={{ fields: ['kategoriename', 'beschreibung'], title: tx('Neue Kategorie') }}
          searchPlaceholder={tx('Kategorie suchen …')}
          avatar="none"
        />
      </WizardStep>

      <WizardStep
        label={tx('Artikeldaten')}
        description={tx('Gib die Grunddaten des Artikels ein.')}
        needs={['kategorie']}
      >
        <div className="space-y-4">
          <Bound form={artikel} name="artikelname" />
          <Bound form={artikel} name="artikelnummer" />
          <Bound form={artikel} name="seriennummer" />
          <Bound form={artikel} name="lagerort" />
          <Bound form={artikel} name="lieferant" />
          <Bound form={artikel} name="anschaffungsdatum" />
          <Bound form={artikel} name="anschaffungspreis" />
          <Bound form={artikel} name="bemerkungen" rows={3} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => artikel.validate(['artikelname'])}
            nextStepLabel={tx('Zustand und Menge')}
          />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Zustand & Menge')}
        description={tx('Lege Zustand, Menge und Einheit des Artikels fest.')}
        needs={['artikelname']}
      >
        <div className="space-y-4">
          <Bound form={artikel} name="zustand" />
          <Bound form={artikel} name="menge" />
          <Bound form={artikel} name="einheit" />
          <Bound form={artikel} name="mindestbestand" />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => artikel.validate(['zustand', 'menge', 'einheit'])}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!submit.result && (
          <SummaryStep
            forms={[artikel]}
            submit={submit}
            whatHappensNext={tx('Der Artikel wird sofort im Inventar aufgenommen und ist dort sichtbar.')}
          />
        )}
      </WizardStep>

      {submit.result && (
        <SuccessStep
          result={submit.result}
          forms={[artikel]}
          submit={submit}
          next={[
            { label: tx('Weiteren Artikel anlegen') },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Über das Inventar kannst du den Artikel jederzeit bearbeiten oder den Bestand anpassen.')}
        />
      )}
    </IntentWizardShell>
  );
}
