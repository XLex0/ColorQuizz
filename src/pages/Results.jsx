import { useLocation, useNavigate } from "react-router-dom";
import "../styles/usability-test.css";
import "../styles/results.css";

function pct(n) {
  return Number.isFinite(n) ? n.toFixed(1) : "0.0";
}

const PASS_THRESHOLD = 85;
const INCONCLUSIVE_BLANKS = 6;

function getRowStatus(r) {
  const blanks = r.unanswered ?? 0;
  const total = r.circlesCount ?? 0;
  const acc = r.accuracyTotal ?? 0;

  if (total > 0 && blanks >= INCONCLUSIVE_BLANKS) {
    return { label: "No concluyente", cls: "row-inconclusive" };
  }
  if (acc >= PASS_THRESHOLD) {
    return { label: "OK", cls: "row-pass" };
  }
  return { label: "Atención", cls: "row-warn" };
}

export default function Results() {
  const nav = useNavigate();
  const { state } = useLocation();

  const results = state?.results ?? [];
  const hasResults = Array.isArray(results) && results.length > 0;

  const totals = hasResults
    ? results.reduce(
        (acc, r) => {
          acc.totalCircles += r.circlesCount ?? 0;
          acc.correct += r.correct ?? 0;
          acc.wrong += r.wrong ?? 0;
          acc.unanswered += r.unanswered ?? 0;
          return acc;
        },
        { totalCircles: 0, correct: 0, wrong: 0, unanswered: 0 }
      )
    : { totalCircles: 0, correct: 0, wrong: 0, unanswered: 0 };

  const overallAccuracy =
    totals.totalCircles > 0 ? (totals.correct / totals.totalCircles) * 100 : 0;

  const overallStatus = (() => {
    if (!hasResults) return null;
    if (totals.unanswered >= INCONCLUSIVE_BLANKS) {
      return { label: "No concluyente", cls: "badge-inconclusive" };
    }
    if (overallAccuracy >= PASS_THRESHOLD) {
      return { label: "OK", cls: "badge-pass" };
    }
    return { label: "Atención", cls: "badge-warn" };
  })();

  return (
    <div className="utWrap">
      {/* ✅ WCAG 2.4.1 Bypass Blocks */}
      <a className="skip-link" href="#main-content">
        Saltar al contenido principal
      </a>

      <header className="utTopbar">
        {/* ✅ Ya NO es H1 en header (evita alerta “H1 in header”) */}
        <span className="utBrand">COLORQUIZZ</span>

        {/* ✅ Nav landmark para que ARC no marque “No nav landmark” */}
        <nav className="utNav" aria-label="Navegación">
          <button className="utExit" type="button" onClick={() => nav("/")}>
            Salir
          </button>
        </nav>
      </header>

      {/* ✅ id para el skip-link */}
      <main id="main-content" className="resMain">
        <section className="resCard" aria-label="Resultados del test">
          <div className="resHeader">
            {/* ✅ Este sí debe ser el H1 de la página */}
            <h1 className="resTitle">Resultados</h1>

            {overallStatus && (
              <span className={`resBadge ${overallStatus.cls}`}>
                {overallStatus.label}
              </span>
            )}
          </div>

          <div className="resRules">
            <div>
              <strong>Umbral (máx 3 errores):</strong> {PASS_THRESHOLD}%
            </div>
            <div>
              <strong>No concluyente:</strong> {INCONCLUSIVE_BLANKS}+ sin responder
            </div>
          </div>

          {!hasResults ? (
            <p className="resMuted">
              No hay resultados para mostrar. Vuelve a Home e inicia el test.
            </p>
          ) : (
            <>
              <div className="resSummary">
                <div className="resMetric">
                  <div className="resMetricLabel">Precisión total</div>
                  <div className="resMetricValue">{pct(overallAccuracy)}%</div>
                </div>

                <div className="resStats">
                  <div>
                    <strong>Aciertos:</strong> {totals.correct}
                  </div>
                  <div>
                    <strong>Errores:</strong> {totals.wrong}
                  </div>
                  <div>
                    <strong>Sin responder:</strong> {totals.unanswered}
                  </div>
                  <div>
                    <strong>Total:</strong> {totals.totalCircles}
                  </div>
                </div>
              </div>

              <div className="resDivider" />

              {/* ✅ Como ya existe H1, este pasa a H2 */}
              <h2 className="resSubTitle">Detalle por test</h2>

              {/* ✅ Scroll accesible por teclado */}
              <div
                className="resTableWrap"
                tabIndex={0}
                role="region"
                aria-label="Tabla de resultados por test (desplazable)"
              >
                <table className="resTable">
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Aciertos</th>
                      <th>Errores</th>
                      <th>Vacíos</th>
                      <th>Precisión</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => {
                      const st = getRowStatus(r);
                      return (
                        <tr key={r.testId} className={st.cls}>
                          <td>{r.testName}</td>
                          <td>{r.correct}</td>
                          <td>{r.wrong}</td>
                          <td>{r.unanswered}</td>
                          <td>{pct(r.accuracyTotal)}%</td>
                          <td className="resStatusCell">{st.label}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="resNote">
                <strong>Nota:</strong> “Atención” solo indica que el desempeño fue
                bajo en ese test. No es un diagnóstico.
              </p>
            </>
          )}

          <div className="resActions">
            <button className="resBtn" type="button" onClick={() => nav("/")}>
              Terminar
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
