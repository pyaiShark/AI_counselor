import { useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { Hero } from '../components/landing/hero';
import { ValueSection } from '../components/landing/value-section';
import { PhilosophySection } from '../components/landing/philosophy-section';
import { UniversitiesShowcase } from '../components/landing/universities-showcase';
import { CTASection } from '../components/landing/cta-section';
import AuthContext from '../context/AuthContext';

export default function LandingPage() {
    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/dashboard');
        }
    }, [isLoggedIn, navigate]);

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
