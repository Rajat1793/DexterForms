import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-polka-yellow flex flex-col">
      <div className="checker-strip" />
      {/* Top nav */}
      <div className="bg-white px-6 py-3" style={{ borderBottom:"4px solid #000", boxShadow:"0 4px 0 #000" }}>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/dexterlogo.png" alt="ChaiForms" height={34} width={130} style={{ height: "auto" }} className="object-contain" priority />
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </div>
      <div className="checker-strip" />
    </div>
  );
}
