import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0e1a] font-mono" style={{
      backgroundImage: "linear-gradient(rgba(101,163,13,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(101,163,13,0.04) 1px, transparent 1px)",
      backgroundSize: "40px 40px"
    }}>
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image src="/dexterlogo1.png" alt="Dexter's Forms" height={34} width={130} className="object-contain" priority />
        </Link>
      </div>
      <div className="flex min-h-screen items-center justify-center px-4">
        {children}
      </div>
    </div>
  );
}
