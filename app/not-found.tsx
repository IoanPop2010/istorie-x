import Link from "next/link";

export default function NotFound() {
  return (
    <div className="unealta">
      <h1 className="titlu-fila">Fila lipsește din dosar</h1>
      <p className="rezumat">Pagina căutată nu există. Poate a fost mutată sau adresa are o greșeală.</p>
      <Link className="btn" href="/">
        Înapoi la inventar
      </Link>
    </div>
  );
}
