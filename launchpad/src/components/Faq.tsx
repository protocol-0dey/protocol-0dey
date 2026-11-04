import { useId, useState } from 'react';
import { IconChevron } from './Icons';

const ITEMS = [
  {
    q: 'Do I need a credit card to start?',
    a: 'No. The 14-day trial of paid plans and the Starter plan both work without a card.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. Upgrade or downgrade at any time. When you upgrade, you only pay the difference for the rest of the period.',
  },
  {
    q: 'How does seat-based pricing work?',
    a: 'You pay for the people who can edit work. Viewers and guests are always free, and you can add or remove seats whenever your team changes.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your workspace stays available in read-only mode for 30 days and you can export everything as CSV or JSON.',
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="container container--narrow">
        <h2 id="faq-title" className="section__title">
          Frequently asked questions
        </h2>
        <ul className="faq">
          {ITEMS.map((item, i) => {
            const open = openIndex === i;
            return (
              <li key={item.q} className="card faq__item">
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`${baseId}-${i}`}
                    onClick={() => setOpenIndex(open ? null : i)}
                  >
                    {item.q}
                    <span className={`faq__chevron${open ? ' is-open' : ''}`}>
                      <IconChevron />
                    </span>
                  </button>
                </h3>
                <div id={`${baseId}-${i}`} role="region" hidden={!open} className="faq__answer">
                  {item.a}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
