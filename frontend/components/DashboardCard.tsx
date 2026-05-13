import Link from 'next/link';
import { ReactNode } from 'react';

interface DashboardCardProps {
    href: string;
    title: string;
    description: string;
    icon: ReactNode; // Permette di passare qualsiasi icona (es. <Users size={32} />)
}

export default function DashboardCard({ href, title, description, icon }: DashboardCardProps) {
    return (
        <Link href={href} className="group">
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-400/40 hover:-translate-y-1 flex flex-col items-center justify-center gap-4 h-48">
                <div className="p-4 bg-blue-50 dark:bg-blue-500/15 rounded-full text-blue-600 dark:text-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {icon}
                </div>
                <div className="text-center">
                    <h3 className="font-semibold text-gray-800 dark:text-slate-100 text-lg">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{description}</p>
                </div>
            </div>
        </Link>
    );
}