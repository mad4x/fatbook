import Link from "next/link";

type VicepresideBackProps = {
  label?: string;
};

const VicepresideBack = ({ label = "Torna al pannello" }: VicepresideBackProps) => {
  return (
    <Link
      href="/vicepresidenza"
      className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
    >
      {label}
    </Link>
  );
};

export default VicepresideBack;