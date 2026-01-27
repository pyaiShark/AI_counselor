import { Link } from 'react-router-dom';
import Button from '@tailus-ui/Button';
import Card from "@tailus-ui/Card"
import { Text, Title } from "@tailus-ui/typography"

export function CTASection() {
    return (
        <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
            <Card variant="mixed" className="mx-auto max-w-3xl text-center p-12 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-border">
                <Title className="text-3xl font-bold sm:text-4xl">
                    Ready to plan your future?
                </Title>
                <Text className="mt-4 text-lg text-muted-foreground">
                    Start your guided counselling journey today.
                </Text>
                <div className="mt-8">
                    <Link to="/signup">
                        <Button.Root className="w-full bg-sky-500 text-white hover:bg-sky-600 dark:bg-white dark:text-black dark:hover:bg-gray-200 sm:w-auto sm:bg-gray-300 sm:text-black sm:hover:bg-gray-400 font-semibold h-12 px-8 text-lg ">
                            Get Started
                        </Button.Root>
                    </Link>
                </div>
            </Card>
        </section>
    );
}
