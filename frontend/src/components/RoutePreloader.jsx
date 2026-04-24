import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function RoutePreloader() {
    const location = useLocation();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = window.setTimeout(() => setVisible(false), 420);
        return () => window.clearTimeout(timer);
    }, [location.pathname, location.search]);

    return (
        <div
            className={`pointer-events-none fixed inset-x-0 top-0 z-[80] h-1 bg-transparent transition-opacity duration-200 ${
                visible ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
        >
            <div className="h-full w-full origin-left animate-[routeLoading_420ms_ease-in-out] bg-accent-500" />
        </div>
    );
}
