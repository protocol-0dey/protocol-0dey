import { IconBoard, IconBolt, IconShield } from './Icons';

const FEATURES = [
  {
    icon: <IconBoard />,
    title: 'One board for everything',
    text: 'Switch between kanban, list, calendar and timeline views of the same work. No duplicated tasks.',
  },
  {
    icon: <IconBolt />,
    title: 'Automations that save hours',
    text: 'Assign, label and move tasks automatically when status, dates or fields change.',
  },
  {
    icon: <IconShield />,
    title: 'Secure by default',
    text: 'Roles, audit log and single sign-on on the Business plan keep your data under control.',
  },
];

export function Features() {
  return (
    <section className="section" id="features" aria-labelledby="features-title">
      <div className="container">
        <h2 id="features-title" className="section__title">
          Everything a team needs, nothing it does not
        </h2>
        <ul className="features">
          {FEATURES.map((f) => (
            <li key={f.title} className="card feature">
              <span className="feature__icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
