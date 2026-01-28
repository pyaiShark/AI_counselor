import { useState, useEffect, useRef, useCallback } from "react";
import Card from "@tailus-ui/Card";
import { Text, Title, Caption } from "@tailus-ui/typography";

import axios from "axios";
import { Globe, MapPin, Link as LinkIcon } from "lucide-react";

export function UniversitiesShowcase() {
    const [universities, setUniversities] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const scrollContainerRef = useRef(null);

    const fetchUniversities = useCallback(async (pageNum) => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/university/top-20/?page=${pageNum}`);
            const newData = response.data.data;
            const pagination = response.data.pagination;

            setUniversities(prev => {
                const uniqueData = [...prev, ...newData].reduce((acc, current) => {
                    const x = acc.find(item => item.name === current.name);
                    if (!x) return acc.concat([current]);
                    return acc;
                }, []);
                return uniqueData;
            });

            setHasMore(pagination.has_next);
        } catch (error) {
            console.error("Failed to fetch universities:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUniversities(1);
    }, []);

    useEffect(() => {
        if (page > 1) {
            fetchUniversities(page);
        }
    }, [page, fetchUniversities]);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 50) {
                if (hasMore && !loading) {
                    setPage(prev => prev + 1);
                }
            }
        }
    };

    return (
        <section className="border-t border-border bg-background px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-12">
                <div className="text-center">
                    <Title className="text-3xl font-bold sm:text-4xl mb-4">
                        Partner Universities
                    </Title>
                    <Text className="text-lg text-muted-foreground">
                        Explore our network of top-ranked institutions
                    </Text>
                </div>

                {/* Vertical Scroll Container with Grid */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="h-[800px] overflow-y-auto pr-2 scrollbar-thin"
                >
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pb-8">
                        {universities.map((uni, index) => (
                            <div
                                key={`${uni.name}-${index}`}
                                className="h-full animate-fade-up"
                                style={{
                                    animation: 'fadeUp 0.6s ease-out forwards',
                                    animationDelay: `${(index % 5) * 0.1}s`,
                                    opacity: 0
                                }}
                            >
                                <Card
                                    variant="outlined"
                                    className="h-full flex flex-col overflow-hidden hover:border-primary/50 transition-colors duration-300"
                                >
                                    <div className="relative h-48 w-full bg-muted/30 p-4 flex items-center justify-center">
                                        {/* Rank Tag */}
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                                Rank #{uni.rank}
                                            </span>
                                        </div>

                                        <img
                                            src={uni.logo || "/placeholder.svg"}
                                            alt={uni.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/placeholder.svg";
                                            }}
                                        />
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col gap-4">
                                        <div>
                                            <Title as="h3" size="lg" weight="semibold" className="leading-tight">
                                                {uni.name}
                                            </Title>
                                            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-4 w-4 shrink-0" />
                                                <span className="text-sm">
                                                    {[
                                                        uni['state-province'],
                                                        uni.country,
                                                        uni.alpha_two_code && `(${uni.alpha_two_code})`
                                                    ].filter(Boolean).join(', ')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-3 pt-4 border-t border-border/50">
                                            {uni.web_pages && uni.web_pages.length > 0 && (
                                                <div className="space-y-1">
                                                    <Caption className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                                                        Website
                                                    </Caption>
                                                    <div className="flex flex-wrap gap-2">
                                                        {uni.web_pages.map((url, i) => (
                                                            <a
                                                                key={i}
                                                                href={url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-primary hover:underline flex items-center gap-1.5 truncate max-w-full"
                                                            >
                                                                <LinkIcon className="h-3 w-3" />
                                                                {new URL(url).hostname}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {uni.domains && uni.domains.length > 0 && (
                                                <div className="space-y-1">
                                                    <Caption className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                                                        Domains
                                                    </Caption>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {uni.domains.map((domain, i) => (
                                                            <span
                                                                key={i}
                                                                className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium text-foreground"
                                                            >
                                                                <Globe className="mr-1 h-3 w-3 text-muted-foreground" />
                                                                {domain}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {/* Loading State Spinner */}
                    {loading && (
                        <div className="w-full flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}
                </div>

                <style>{`
                    @keyframes fadeUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </div>
        </section>
    );
}
