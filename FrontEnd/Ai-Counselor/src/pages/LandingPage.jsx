import { Hero } from '../components/landing/hero';
import { ValueSection } from '../components/landing/value-section';
import { PhilosophySection } from '../components/landing/philosophy-section';
import { UniversitiesShowcase } from '../components/landing/universities-showcase';
import { CTASection } from '../components/landing/cta-section';

export default function LandingPage() {
    return (
        <main>
            <Hero />
            <ValueSection />
            <PhilosophySection />
            <UniversitiesShowcase />
            <CTASection />
        </main>
    );
}
