import Process from '../components/Process';
import TeamSection from '../components/TeamSection';
import PageIntro from './PageIntro';
import useSiteContent from '../site-content/SiteContentContext';

export default function AboutPage() {
  const { content } = useSiteContent();
  return (
    <>
      <PageIntro
        {...content.pages.about}
      />
      <Process />
      <TeamSection />
    </>
  );
}
