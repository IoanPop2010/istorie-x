import Link from "next/link";
import { getUnits, MODULES, ROMAN } from "@/lib/content";
import { ModeToggle } from "./ModeToggle";
import { UnitNav } from "./UnitNav";

function Contents() {
  const units = getUnits().map(({ slug, nr, title, module }) => ({ slug, nr, title, module }));
  return (
    <>
      <ModeToggle />
      <div className="cotor-unelte">
        <Link href="/cronologie">Cronologie</Link>
        <Link href="/glosar">Glosar</Link>
        <Link href="/fise">Fișe de termeni</Link>
        <Link href="/cautare">Căutare</Link>
        <Link href="/despre">Despre și surse</Link>
      </div>
      <UnitNav units={units} modules={MODULES} roman={ROMAN} />
    </>
  );
}

export function Spine() {
  return (
    <aside className="cotor" aria-label="Cuprins">
      <Link href="/" className="cotor-titlu">
        Pagini de istorie
        <small>clasa a X-a, științe sociale</small>
      </Link>
      <Contents />
    </aside>
  );
}

export function MobileBar() {
  return (
    <div className="bara-mobil">
      <Link href="/" className="cotor-titlu">
        Pagini de istorie
      </Link>
      <details className="sertar">
        <summary>Cuprins</summary>
        <div className="cotor-mobil">
          <Contents />
        </div>
      </details>
    </div>
  );
}
