import ContactSection from '../components/Footer';
import PageIntro from './PageIntro';
import useSiteContent from '../site-content/SiteContentContext';

export default function ContactPage() {
  const { content } = useSiteContent();
  return (
    <>
      <PageIntro {...content.pages.contact} />
      <ContactSection />
    </>
  );
}
