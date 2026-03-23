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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-blue-200 hover:-translate-y-1 flex flex-col items-center justify-center gap-4 h-48">
                <div className="p-4 bg-blue-50 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {icon}
                </div>
                <div className="text-center">
                    <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>
            </div>
        </Link>
    );
}