import Card from "@tailus-ui/Card"
import { Text, Title } from "@tailus-ui/typography"

const values = [
    {
        title: 'Guided, stage-based counseling',
        description: 'Not a chatbot. A structured decision system with clear phases.',
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-accent"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
            </svg>
        )
    },
    {
        title: 'Personalized university shortlists',
        description: 'Get explained risks and insights tailored to your profile.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-accent"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
        )
    },
    {
        title: 'Clear decisions with execution tasks',
        description: 'Locked steps keep you on track from choice to action.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-accent"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
        )
    },
];

export function ValueSection() {
    return (
        <section className="border-t border-border bg-background px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-12">
                <div className="text-center">
                    <Title className="text-3xl font-bold sm:text-4xl">
                        What makes AI Counselor different
                    </Title>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {values.map((value, index) => (
                        <Card
                            key={index}
                            variant="mixed"
                            className="flex flex-col gap-4 p-6 bg-white/60 dark:bg-white/5 backdrop-blur-lg border-white/50 dark:border-white/10 shadow-sm transition-all hover:bg-white/80 dark:hover:bg-white/10"
                        >
                            <div className="flex items-start gap-3">
                                {value.icon}
                                <Title as="h3" size="base" weight="semibold">
                                    {value.title}
                                </Title>
                            </div>
                            <Text size="sm" className="text-muted-foreground">{value.description}</Text>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
