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
    return { 
      label: "No concluyente", 
      cls: "row-inconclusive",
      description: "Demasiadas respuestas sin completar. Se requiere más información para evaluar correctamente."
    };
  }
  if (acc >= PASS_THRESHOLD) {
    return { 
      label: "Visión normal", 
      cls: "row-pass",
      description: "Excelente desempeño. Los resultados sugieren visión cromática normal."
    };
  }
  return { 
    label: "Posible deficiencia", 
    cls: "row-warn",
    description: "Bajo desempeño detectado. Consulta con un oftalmólogo para confirmación."
  };
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
      return { 
        label: "No concluyente", 
        cls: "badge-inconclusive",
        description: "Resultados generales no concluyentes. Se necesita completar más respuestas."
      };
    }
    if (overallAccuracy >= PASS_THRESHOLD) {
      return { 
        label: "Visión normal", 
        cls: "badge-pass",
        description: "Excelente desempeño general. Tu visión cromática parece ser normal."
      };
    }
    return { 
      label: "Posible deficiencia", 
      cls: "badge-warn",
      description: "Bajo desempeño general. Se recomienda consulta con un oftalmólogo."
    };
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
            <h1 className="resTitle" tabIndex={0}>Resultados</h1>

            {overallStatus && (
              <span 
                className={`resBadge ${overallStatus.cls}`}
                tabIndex={0}
                role="status"
                aria-live="polite"
                aria-label={`Estado general: ${overallStatus.label}. ${overallStatus.description}`}
              >
                {overallStatus.label}
              </span>
            )}
          </div>

          <div className="resRules" tabIndex={0} role="region" aria-labelledby="rules-title">
            <h3 id="rules-title" className="sr-only">Criterios de evaluación</h3>
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
              <div className="resSummary" role="region" aria-labelledby="summary-title">
                <h3 id="summary-title" className="sr-only">Resumen de precisión</h3>
                <div className="resMetric" tabIndex={0}>
                  <div className="resMetricLabel">Precisión total</div>
                  <div className="resMetricValue" aria-live="polite">{pct(overallAccuracy)}%</div>
                </div>

                <div className="resStats" tabIndex={0} role="region" aria-labelledby="stats-title">
                  <h4 id="stats-title" className="sr-only">Estadísticas detalladas</h4>
                  <div>
                    <strong>Aciertos:</strong> <span aria-label={`${totals.correct} aciertos`}>{totals.correct}</span>
                  </div>
                  <div>
                    <strong>Errores:</strong> <span aria-label={`${totals.wrong} errores`}>{totals.wrong}</span>
                  </div>
                  <div>
                    <strong>Sin responder:</strong> <span aria-label={`${totals.unanswered} sin responder`}>{totals.unanswered}</span>
                  </div>
                  <div>
                    <strong>Total:</strong> <span aria-label={`${totals.totalCircles} círculos totales`}>{totals.totalCircles}</span>
                  </div>
                </div>
              </div>

              <div className="resDivider" />

              {/* ✅ Como ya existe H1, este pasa a H2 */}
              <h2 className="resSubTitle" tabIndex={0}>Detalle por test</h2>

              {/* ✅ Scroll accesible por teclado */}
              <div
                className="resTableWrap"
                tabIndex={0}
                role="region"
                aria-label="Tabla de resultados por test (desplazable)"
              >
                <table className="resTable" role="table" aria-label="Detalle de resultados de cada test">
                  <thead>
                    <tr>
                      <th scope="col">Test</th>
                      <th scope="col">Aciertos</th>
                      <th scope="col">Errores</th>
                      <th scope="col">Vacíos</th>
                      <th scope="col">Precisión</th>
                      <th scope="col">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => {
                      const st = getRowStatus(r);
                      return (
                        <tr 
                          key={r.testId} 
                          className={st.cls}
                          tabIndex={0}
                          role="row"
                          aria-label={`${r.testName}: ${st.label} - ${pct(r.accuracyTotal)}% precisión. ${st.description}`}
                        >
                          <td role="cell">{r.testName}</td>
                          <td role="cell" aria-label={`Aciertos: ${r.correct}`}>{r.correct}</td>
                          <td role="cell" aria-label={`Errores: ${r.wrong}`}>{r.wrong}</td>
                          <td role="cell" aria-label={`Sin responder: ${r.unanswered}`}>{r.unanswered}</td>
                          <td role="cell" aria-label={`Precisión: ${pct(r.accuracyTotal)}%`}>{pct(r.accuracyTotal)}%</td>
                          <td className="resStatusCell" role="cell" aria-label={`Estado: ${st.label}. ${st.description}`}>{st.label}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="resNote" tabIndex={0} role="note">
                <strong>Nota importante:</strong> Este test es solo una herramienta orientativa. 
                "Posible deficiencia" sugiere una evaluación médica profesional. 
                Solo un oftalmólogo puede diagnosticar daltonismo.
              </p>
            </>
          )}

          <div className="resActions">
            <button 
              className="resBtn" 
              type="button" 
              onClick={() => nav("/")}
              tabIndex={0}
              aria-label="Terminar y volver al inicio"
            >
              Terminar
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
