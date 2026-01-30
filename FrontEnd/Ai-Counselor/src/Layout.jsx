import { Suspense } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { Outlet } from 'react-router-dom';
import Loading from './components/Common/Loading';

function Layout() {
    return (
        <>
            <Header />
            <Suspense fallback={<Loading />}>
                <Outlet />
            </Suspense>
            <Footer />
        </>
    )
}

export default Layout;