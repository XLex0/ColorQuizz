import { useLocation, useNavigate } from "react-router-dom";
import "../styles/usability-test.css";
import "../styles/results.css";

function pct(n) {
  return Number.isFinite(n) ? n.toFixed(1) : "0.0";
}

// ✅ Reglas
// Máx 3 errores en 20 => 17/20 = 85%
const PASS_THRESHOLD = 85;

// Si deja >= 6 en blanco (de 20), el resultado es poco confiable
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

  // ✅ Estado global (por promedio total)
  const overallStatus = (() => {
    if (!hasResults) return null;
    // Si en total dejó muchos blancos, marcamos no concluyente
    if (totals.unanswered >= INCONCLUSIVE_BLANKS) {
      return { label: "No concluyente", cls: "badge-inconclusive" };
    }
    if (overallAccuracy >= PASS_THRESHOLD) {
      return { label: "OK", cls: "badge-pass" };
    }
    return { label: "Atención", cls: "badge-warn" };
  })();

  return (
    <div className="utWrap" tabIndex={0}>
      <header className="utTopbar">
        <h1 className="utBrand">COLORQUIZZ</h1>
        <button className="utExit" type="button" onClick={() => nav("/")}>
          Salir
        </button>
      </header>

      <main className="resMain">
        <section className="resCard" aria-label="Resultados del test">
          <div className="resHeader">
            <h2 className="resTitle">Resultados</h2>
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

              <h3 className="resSubTitle">Detalle por test</h3>

              <div className="resTableWrap">
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
