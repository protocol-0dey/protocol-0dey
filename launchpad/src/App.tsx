import { useCallback, useState } from 'react';
import { Faq } from './components/Faq';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Pricing } from './components/Pricing';
import { SignupModal, type SignupPreset } from './components/SignupModal';
import { useTheme } from './hooks/useTheme';
import type { Billing, Plan } from './lib/pricing';

export function App() {
  const { theme, toggle } = useTheme();
  const [billing, setBilling] = useState<Billing>('yearly');
  const [seats, setSeats] = useState(5);
  const [preset, setPreset] = useState<SignupPreset | null>(null);

  const open = useCallback(
    (plan: Plan['id'] = 'team') => setPreset({ plan, billing, seats }),
    [billing, seats],
  );
  const close = useCallback(() => setPreset(null), []);

  return (
    <>
      <Header theme={theme} onToggleTheme={toggle} onStart={() => open()} />
      <main>
        <Hero onStart={() => open()} />
        <Features />
        <Pricing
          billing={billing}
          seats={seats}
          onBillingChange={setBilling}
          onSeatsChange={setSeats}
          onChoose={(plan) => open(plan.id)}
        />
        <Faq />
      </main>
      <Footer onStart={() => open()} />
      {preset && <SignupModal preset={preset} onClose={close} />}
    </>
  );
}
