import type { Metadata } from "next";
import { Search } from "@/components/Tools";

export const metadata: Metadata = { title: "Căutare" };

export default function SearchPage() {
  return (
    <div className="unealta">
      <h1 className="titlu-fila">Căutare</h1>
      <Search />
    </div>
  );
}
