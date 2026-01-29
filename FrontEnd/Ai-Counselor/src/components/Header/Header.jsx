import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../tailus-ui/Button';
import { useEffect, useState, useContext } from 'react';
import ThemeToggleButton from '../ThemeTogle/ThemeToggleButton';
import { Menu, User, LogOut } from 'lucide-react';
import Drawer from '../tailus-ui/Drawer';
import { twMerge } from 'tailwind-merge';
import AuthContext from '../../context/AuthContext';

function Header() {
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Use AuthContext instead of local state
    const { isLoggedIn, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are on an auth page
    const isAuthPage = ['/login', '/signup'].includes(location.pathname);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            // Optimized scroll handler: only update if value changes
            const isScrolled = window.scrollY > 20;
            setScrolled(prev => prev !== isScrolled ? isScrolled : prev);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <header
                className={twMerge(
                    "fixed top-0 left-0 right-0 z-40 border-b border-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transition-all duration-300",
                    scrolled ? "py-2 shadow-sm" : "py-4"
                )}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">

                        <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 transition-opacity hover:opacity-90">
                            <div className="relative h-10 w-10 sm:h-12 sm:w-12">
                                <img
                                    src="/logo.png"
                                    alt="AI Counselor Logo"
                                    className="object-contain w-full h-full rounded-lg"
                                />
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-foreground tracking-tight">AI Counselor</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-4">
                            {mounted && <ThemeToggleButton />}

                            {isLoggedIn ? (
                                <>
                                    <Link to="/profile">
                                        <Button.Root variant="ghost" className="flex items-center gap-2">
                                            <Button.Icon>
                                                <User className="w-4 h-4" />
                                            </Button.Icon>
                                            <Button.Label>Profile</Button.Label>
                                        </Button.Root>
                                    </Link>
                                    <Button.Root
                                        variant="outline"
                                        className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={handleLogout}
                                    >
                                        <Button.Label>Sign Out</Button.Label>
                                    </Button.Root>
                                </>
                            ) : (
                                !isAuthPage && (
                                    <>
                                        <Link to="/login">
                                            <Button.Root className="bg-white text-black border border-black hover:bg-gray-100 transition-colors">
                                                <Button.Label>Login</Button.Label>
                                            </Button.Root>
                                        </Link>

                                        <Link to="/signup">
                                            <Button.Root className="bg-blue-500 text-white hover:bg-blue-400">
                                                <Button.Label>Get Started</Button.Label>
                                            </Button.Root>
                                        </Link>
                                    </>
                                )
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        {!isAuthPage && (
                            <div className="flex md:hidden items-center gap-2">
                                {mounted && <ThemeToggleButton />}
                                <Button.Root variant="ghost" size="icon" onClick={() => setDrawerOpen(true)}>
                                    <Button.Icon>
                                        <Menu className="h-5 w-5" />
                                    </Button.Icon>
                                </Button.Root>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Content Spacer to prevent overlap */}
            <div className={twMerge("h-[73px]", scrolled ? "h-[57px]" : "h-[73px]")} />

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <div className="flex flex-col space-y-4">
                    <div className="border-t border-gray-200 dark:border-gray-800 my-4" />
                    {isLoggedIn ? (
                        <>
                            <Link to="/profile" onClick={() => setDrawerOpen(false)}>
                                <Button.Root className="w-full justify-center" variant="ghost">
                                    <Button.Label>Profile</Button.Label>
                                </Button.Root>
                            </Link>
                            <Link to="/dashboard" onClick={() => setDrawerOpen(false)}>
                                <Button.Root className="w-full justify-center">
                                    <Button.Label>Go to Dashboard</Button.Label>
                                </Button.Root>
                            </Link>
                            <Button.Root
                                variant="outline"
                                className="w-full justify-center text-red-500 border-red-500"
                                onClick={() => {
                                    handleLogout();
                                    setDrawerOpen(false);
                                }}
                            >
                                <Button.Label>Sign Out</Button.Label>
                            </Button.Root>
                        </>
                    ) : (
                        !isAuthPage && (
                            <>
                                <Link to="/login" onClick={() => setDrawerOpen(false)}>
                                    <Button.Root variant="outline" className="w-full justify-center">
                                        <Button.Label>Login</Button.Label>
                                    </Button.Root>
                                </Link>
                                <Link to="/signup" onClick={() => setDrawerOpen(false)}>
                                    <Button.Root className="w-full justify-center">
                                        <Button.Label>Get Started</Button.Label>
                                    </Button.Root>
                                </Link>
                            </>
                        )
                    )}
                </div>
            </Drawer>
        </>
    );
}

export default Header;
