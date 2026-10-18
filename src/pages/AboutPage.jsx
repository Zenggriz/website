import Process from '../components/Process';
import TeamSection from '../components/TeamSection';
import PageIntro from './PageIntro';

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About Zenggrix"
        title="A practical partner for your digital growth"
        description="We help businesses improve everyday work with thoughtful software, reliable digital systems, and solutions designed around real needs."
      />
      <Process />
      <TeamSection />
    </>
  );
}
