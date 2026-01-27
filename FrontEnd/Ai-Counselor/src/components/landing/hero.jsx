import { Link } from 'react-router-dom';
import Button from '@tailus-ui/Button';
import Card from "@tailus-ui/Card"
import { Text, Title } from "@tailus-ui/typography"

export function Hero() {
    return (
        <section
            className="relative flex min-h-[80vh] items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-20 sm:px-6 lg:px-8"
            style={{ backgroundImage: 'url("/cambridge.jpeg")' }}
        >
            <div className="absolute inset-0 bg-black/40"></div>

            <Card
                variant="mixed"
                className="relative mx-auto max-w-3xl space-y-8 text-center p-8 bg-black/30 dark:bg-black/30 backdrop-blur-md border-white/20 dark:border-white/20 shadow-2xl"
            >
                <Title className="text-4xl font-bold tracking-tight sm:text-6xl drop-shadow-md text-white dark:text-white">
                    Plan your study-abroad journey with a guided AI counsellor.
                </Title>

                <Text className="text-xl text-gray-100 dark:text-gray-100 drop-shadow">
                    An AI decision system that understands your profile and guides you
                    step-by-step from confusion to clarity.
                </Text>

                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center pt-4">
                    <Link to="/signup">
                        <Button.Root className="w-full bg-white text-black hover:bg-gray-300 sm:w-auto font-semibold h-12 px-8 text-lg ">
                            Get Started
                        </Button.Root>
                    </Link>
                    <Link to="/login">
                        <Button.Root
                            variant="outline"
                            className="w-full border-white text-white hover:bg-white/20 hover:text-white sm:w-auto bg-transparent backdrop-blur-sm h-12 px-8 text-lg"
                        >
                            Login
                        </Button.Root>
                    </Link>
                </div>
            </Card>
        </section>
    );
}
