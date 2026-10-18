import ContactSection from '../components/Footer';
import PageIntro from './PageIntro';

export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="Let’s talk about what your business needs"
        description="Get in touch with our team in Sukkur. We’ll listen to your goals and help you find a practical next step."
      />
      <ContactSection />
    </>
  );
}
