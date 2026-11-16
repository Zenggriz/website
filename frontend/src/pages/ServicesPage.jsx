import { ServiceIcon } from '../components/icons';
import PageIntro from './PageIntro';
import useSiteContent from '../site-content/SiteContentContext';

export default function ServicesPage() {
  const { content } = useSiteContent();
  return (
    <>
      <PageIntro {...content.pages.services} />
      <section className="section">
        <div className="container-x">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {content.services.map((service) => (
              <li key={service.id}>
                <article className="card h-full p-6 sm:p-7">
                  <span className="grid h-12 w-12 place-items-center rounded-xl border border-brand-border bg-brand-dark text-brand-accent">
                    <ServiceIcon id={service.id} className="h-5 w-5" />
                  </span>
                  <h2 className="mt-5 text-xl font-semibold text-white">{service.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{service.description}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
