import Card from "@tailus-ui/Card"
import { Text, Title, Caption } from "@tailus-ui/typography"

const universities = [
    {
        name: 'Oxford University',
        country: 'UK',
        image: '/universities/oxford.jpg',
    },
    {
        name: 'Harvard University',
        country: 'USA',
        image: '/universities/harvard.jpg',
    },
    {
        name: 'Cambridge University',
        country: 'UK',
        image: 'https://imgs.search.brave.com/EcP3O5qRruDqu2dyMil8MGn3fe2ZdQROeGY4QF4o12Y/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/YnJpdGFubmljYS5j/b20vODUvMTMwODUt/MDUwLUMyRTg4Mzg5/L0NvcnB1cy1DaHJp/c3RpLUNvbGxlZ2Ut/VW5pdmVyc2l0eS1v/Zi1DYW1icmlkZ2Ut/RW5nbGFuZC5qcGc_/dz00MDAmaD0zMDAm/Yz1jcm9w',
    },
    {
        name: 'Stanford University',
        country: 'USA',
        image: '/universities/stanford.jpg',
    },
    {
        name: 'MIT',
        country: 'USA',
        image: '/universities/mit.jpg',
    },
    {
        name: 'University of Toronto',
        country: 'Canada',
        image: '/universities/toronto.jpg',
    },
];

export function UniversitiesShowcase() {
    return (
        <section className="border-t border-border bg-background px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-12">
                <div className="text-center">
                    <Title className="text-3xl font-bold sm:text-4xl mb-4">
                        Partner Universities
                    </Title>
                    <Text className="text-lg text-muted-foreground">
                        Get matched with top universities around the world
                    </Text>
                </div>

                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {universities.map((uni, index) => (
                        <Card
                            key={index}
                            variant="mixed"
                            className="group relative overflow-hidden p-0 cursor-pointer hover:border-primary transition-all duration-300"
                        >
                            <div className="relative h-48 w-full overflow-hidden">
                                <img
                                    src={uni.image || "/placeholder.svg"}
                                    alt={uni.name}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <Text className="text-white font-medium">Explore Program</Text>
                                </div>
                            </div>

                            <div className="p-4">
                                <Title as="h3" size="base" weight="semibold">{uni.name}</Title>
                                <Caption as="p" className="mt-1">{uni.country}</Caption>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
