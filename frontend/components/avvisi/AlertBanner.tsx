interface AlertBannerProps {
  title: string;
  message: string;
}

export function AlertBanner({ title, message }: AlertBannerProps) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
      <p className="font-bold flex items-center gap-2">⚠️ {title}</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
}
