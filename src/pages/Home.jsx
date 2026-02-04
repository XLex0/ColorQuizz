import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";
import palette from "../assets/images/palette.png";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";

// ✅ Agregamos textScale
const DEFAULTS = { contrast: 100, brightness: 100, textScale: 100 };

export default function Home() {
  const nav = useNavigate();

  const homeRef = useRef(null);
  const instructionsRef = useRef(null);
  const profileRef = useRef(null);
  const testimonialsRef = useRef(null);

  // ✅ Scope de TAB para la “página de arriba” (Navbar + Home)
  const homeScopeRef = useRef(null);

  const [openSettings, setOpenSettings] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  // ✅ Cargamos settings y “completamos” defaults si faltan keys
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("settings");
    const parsed = saved ? JSON.parse(saved) : {};
    return { ...DEFAULTS, ...parsed }; // <-- clave para que cuadre
  });

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  // ✅ Incluimos --textScale
  const styleVars = useMemo(
    () => ({
      "--contrast": `${settings.contrast}%`,
      "--brightness": `${settings.brightness}%`,
      "--textScale": `${settings.textScale ?? 100}%`,
    }),
    [settings.contrast, settings.brightness, settings.textScale]
  );

  const reset = () => setSettings(DEFAULTS);

  useEffect(() => {
    const items = [
      { id: "home", el: homeRef.current },
      { id: "instructions", el: instructionsRef.current },
      { id: "profile", el: profileRef.current },
      { id: "testimonials", el: testimonialsRef.current },
    ].filter((x) => x.el);

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        const section = visible?.target?.dataset?.section;
        if (!section) return;

        if (section === "home") setActiveTab(null);
        else setActiveTab(section);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0.05, 0.15, 0.3, 0.5] }
    );

    items.forEach((it) => obs.observe(it.el));
    return () => obs.disconnect();
  }, []);

  // ✅ Helper: focusables dentro de un contenedor (para TAB por sección visible)
  const getFocusable = (root) => {
    if (!root) return [];

    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    return Array.from(root.querySelectorAll(selectors)).filter((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        !el.hasAttribute("disabled")
      );
    });
  };

  // ✅ TAB “por página/sección”: si estás abajo NO regresa arriba.
  // - En HOME: permite tabear Navbar + hero + tabs (homeScopeRef)
  // - En otras secciones: tabea SOLO dentro de la sección visible
  useEffect(() => {
    const sectionRoots = {
      home: homeScopeRef,
      instructions: instructionsRef,
      profile: profileRef,
      testimonials: testimonialsRef,
    };

    const getActiveRoot = () => {
      const key = activeTab ?? "home"; // null => home
      return sectionRoots[key]?.current ?? null;
    };

    const onTabKeyDown = (e) => {
      if (e.key !== "Tab") return;

      const root = getActiveRoot();
      if (!root) return;

      const focusables = getFocusable(root);
      if (focusables.length === 0) return;

      const current = document.activeElement;
      const inside = root.contains(current);

      // Si el foco se fue fuera del “scope” (ej. click en otra parte),
      // al presionar TAB lo re-encarrilamos dentro del scope visible.
      if (!inside) {
        e.preventDefault();
        const target = e.shiftKey
          ? focusables[focusables.length - 1]
          : focusables[0];
        target.focus();
        return;
      }

      // Wrap-around: evita que TAB salga del scope y “salte” al inicio del DOM.
      const idx = focusables.indexOf(current);
      if (idx === -1) return;

      if (!e.shiftKey && idx === focusables.length - 1) {
        e.preventDefault();
        focusables[0].focus();
      }

      if (e.shiftKey && idx === 0) {
        e.preventDefault();
        focusables[focusables.length - 1].focus();
      }
    };

    // Captura = evita que el navegador continúe al siguiente focus del DOM (arriba)
    window.addEventListener("keydown", onTabKeyDown, true);
    return () => window.removeEventListener("keydown", onTabKeyDown, true);
  }, [activeTab]);

  // keyboard arrows navigation between page sections
  useEffect(() => {
    const sections = [
      { id: "home", ref: homeRef },
      { id: "instructions", ref: instructionsRef },
      { id: "profile", ref: profileRef },
      { id: "testimonials", ref: testimonialsRef },
    ];

    const onKey = (e) => {
      const keysNext = ["ArrowDown", "ArrowRight"];
      const keysPrev = ["ArrowUp", "ArrowLeft"];
      if (![...keysNext, ...keysPrev].includes(e.key)) return;

      const activeIndex = sections.findIndex((s) => {
        const el = s.ref.current;
        return el === document.activeElement || el?.contains(document.activeElement);
      });

      if (keysNext.includes(e.key)) {
        e.preventDefault();
        const next = sections[Math.min(sections.length - 1, (activeIndex === -1 ? 0 : activeIndex) + 1)];
        next?.ref.current?.focus();
      }

      if (keysPrev.includes(e.key)) {
        e.preventDefault();
        const prev = sections[Math.max(0, (activeIndex === -1 ? sections.length - 1 : activeIndex) - 1)];
        prev?.ref.current?.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [homeRef, instructionsRef, profileRef, testimonialsRef]);

  const scrollTo = (section) => {
    const map = {
      home: homeRef.current,
      instructions: instructionsRef.current,
      profile: profileRef.current,
      testimonials: testimonialsRef.current,
    };

    const el = map[section];
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => el.focus({ preventScroll: true }), 350);
  };

  const scrollToTop = () => scrollTo("home");

  return (
    <div className="app">
      {/* ✅ AppContent recibe variables incluyendo textScale */}
      <div className="appContent" style={styleVars}>
        <a className="skip-link" href="#main-content">
          Saltar al contenido principal
        </a>

        {/* ✅ Navbar pertenece a la página de arriba + Home (scope para TAB cuando estás arriba) */}
        <div ref={homeScopeRef}>
          <Navbar onOpenSettings={() => setOpenSettings(true)} />

          <main id="main-content" className="page">
            <section ref={homeRef} data-section="home" className="screen screen-home" tabIndex={0}>
              <div className="hero">
                <div className="heroBox">
                  <h2 className="heroQ" tabIndex={0}>¿Tienes daltonismo?</h2>
                  <h1 className="heroTitle" tabIndex={0}>HACER PRUEBA</h1>

                  <button className="primaryBtn" onClick={() => nav("/test")}>
                    COMENZAR
                  </button>
                </div>
              </div>

              <div className="tabs" role="navigation" aria-label="Secciones de la página">
                <button
                  className={`tab ${activeTab === "instructions" ? "active" : ""}`}
                  onClick={() => scrollTo("instructions")}
                >
                  Instrucciones
                </button>
                <button
                  className={`tab ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => scrollTo("profile")}
                >
                  Perfil Visual
                </button>
                <button
                  className={`tab ${activeTab === "testimonials" ? "active" : ""}`}
                  onClick={() => scrollTo("testimonials")}
                >
                  Testimonios
                </button>
              </div>
            </section>
          </main>
        </div>

        {/* ✅ El resto de secciones quedan FUERA del scope del Home */}
        <main className="page">
          {/* PANTALLA 2 */}
          <section
            ref={instructionsRef}
            data-section="instructions"
            className="screen screen-instructions"
            tabIndex={0}
            role="region"
            aria-labelledby="instructions-title"
          >
            <header className="instructionsHeader">
              <div className="helpIcon" aria-hidden="true">?</div>
              <h2 id="instructions-title" className="instructionsTitle" >
                Instrucciones
              </h2>
            </header>

            <div className="instructionsLayout">
              <img
                className="instructionsImg"
                src={palette}
                alt="Rueda de colores"
                draggable="false"
                tabIndex={0}
              />

              <div className="instructionsCard" tabIndex={0} aria-label="Instrucciones detalladas del Test de Daltonismo">
                <ol className="instructionsList">
                  <li tabIndex={0}>
                    Presiona <strong>“Comenzar”</strong> para iniciar el test.
                    El juego consta de <strong>6 rondas</strong>, cada una diseñada para evaluar un tipo diferente de daltonismo.
                  </li>

                  <li tabIndex={0}>
                    Observa la sección <strong>“Referencia”</strong>.
                    Esta imagen te muestra cómo debería verse el dibujo correctamente pintado.
                  </li>

                  <li tabIndex={0}>
                    Selecciona un color desde la <strong>Paleta de colores</strong>:
                    <ul>
                      <li>Puedes hacer clic con el <strong>mouse</strong> sobre el color.</li>
                      <li>O usar el <strong>teclado</strong> con las teclas del <strong>0 al 9</strong>.</li>
                    </ul>
                  </li>

                  <li tabIndex={0}>
                    Pinta el <strong>dibujo en blanco y negro</strong>:
                    <ul>
                      <li>Haz clic sobre los círculos para aplicar el color seleccionado.</li>
                      <li>
                        También puedes usar el <strong>teclado</strong> presionando la letra que aparece en cada círculo
                        (<strong>Q W E R T A S D F G Z X C V B N M H J K</strong>).
                      </li>
                    </ul>
                  </li>

                  <li tabIndex={0}>
                    Completa el dibujo siguiendo la referencia para avanzar a la siguiente ronda.
                  </li>

                  <li tabIndex={0}>
                    Al finalizar las 6 rondas, se mostrarán tus <strong>resultados</strong> según tus aciertos.
                  </li>

                  <li tabIndex={0}>
                    Este test es solo una <strong>herramienta orientativa</strong> y no reemplaza una evaluación médica profesional.
                  </li>
                </ol>
              </div>
            </div>

            <button className="backTop" onClick={scrollToTop} aria-label="Volver arriba">
              ▲
            </button>
          </section>

          {/* PANTALLA 3 */}
          <section
            ref={profileRef}
            data-section="profile"
            className="screen screen-profile"
            tabIndex={0}
            role="region"
            aria-labelledby="profile-title"
          >
            <h2 id="profile-title" className="sectionTitle profileTitle">
              Perfil Visual
            </h2>

            <div className="profileStack">
              <article className="profileCard" aria-label="Qué es el daltonismo">
                <h3 className="profileCardTitle" tabIndex={0}>¿Qué es el daltonismo?</h3>
                <p className="profileText" tabIndex={0}>
                  Si usted tiene daltonismo (deficiencia en la visión de los colores),
                  significa que ve los colores de manera diferente a la mayoría de las
                  personas. El daltonismo casi siempre hace difícil notar la diferencia
                  entre ciertos colores.
                </p>
              </article>

              <article className="profileCard" aria-label="Riesgos de daltonismo">
                <h3 className="profileCardTitle" tabIndex={0}>¿Corro riesgo de presentar daltonismo?</h3>
                <section tabIndex={0} aria-label="Riesgos de daltonismo">
                  <p className="profileText">
                    Los hombres corren un riesgo mucho mayor de presentar daltonismo que las
                    mujeres. También es más probable que usted sea daltónico si:
                  </p>
                  <ul className="profileBullets">
                    <li>Tiene antecedentes familiares de daltonismo</li>
                    <li>Tiene ciertas enfermedades oculares</li>
                    <li>
                      Tiene ciertos problemas de salud, como diabetes, enfermedad de Alzheimer
                      o esclerosis múltiple
                    </li>
                  </ul>
                </section>
              </article>

              <article className="profileCard" aria-label="Tipos de daltonismo">
                <h3 className="profileCardTitle" tabIndex={0}>Tipos de daltonismo</h3>
                <section tabIndex={0} aria-label="Tipos de daltonismo">
                  <p className="profileText">El daltonismo rojo-verde es el más común e incluye:</p>
                  <ul className="profileBullets">
                    <li><strong>Deuteranomalía:</strong> el verde se ve rojizo (leve).</li>
                    <li><strong>Protanomalía:</strong> el rojo se ve verdoso y menos brillante (leve).</li>
                    <li><strong>Protanopia y deuteranopia:</strong> no se distingue entre rojo y verde.</li>
                  </ul>

                  <p className="profileText">El daltonismo azul-amarillo es menos común e incluye:</p>
                  <ul className="profileBullets">
                    <li><strong>Tritanomalía:</strong> difícil diferenciar azul-verde y amarillo-rojo.</li>
                    <li>
                      <strong>Tritanopia:</strong> no se distinguen azul-verde, violeta-rojo ni
                      amarillo-rosado; colores menos brillantes.
                    </li>
                  </ul>

                  <p className="profileText">
                    El daltonismo completo (monocromacia) es raro y hace que la persona no vea colores;
                    puede incluir visión poco clara y sensibilidad a la luz.
                  </p>
                </section>
              </article>
            </div>

            <button className="backTop" onClick={scrollToTop} aria-label="Volver arriba">
              ▲
            </button>
          </section>

          {/* PANTALLA 4 */}
          <section
            ref={testimonialsRef}
            data-section="testimonials"
            className="screen screen-testimonials"
            tabIndex={0}
            role="region"
            aria-labelledby="testimonials-title"
          >
            <h2 id="testimonials-title" className="sectionTitle testimonialsTitle" tabIndex={0}>
              Testimonios
            </h2>

            <div className="testimonialsStack">
              <article className="testimonialCard" tabIndex={0} aria-label="Testimonio de Valeria P.">
                <h3 className="testimonialPerson" tabIndex={0}>Valeria P.</h3>
                <span className="stars" role="img" aria-label="Calificación 5 de 5">
                  ★★★★★
                </span>
                <p className="testimonialText" tabIndex={0}>
                  “Muy útil para entender mi visión. Me ayudó a identificar patrones y a sentirme más segura usando el modo accesible.”
                </p>
              </article>

              <article className="testimonialCard" tabIndex={0} aria-label="Testimonio de Diego M.">
                <h3 className="testimonialPerson" tabIndex={0}>Diego M.</h3>
                <span className="stars" role="img" aria-label="Calificación 4 de 5">
                  ★★★★☆
                </span>
                <p className="testimonialText" tabIndex={0}>
                  “La interfaz es clara y rápida. Me gustó que el feedback sea inmediato y que todo esté explicado sin abrumar.”
                </p>
              </article>

              <article className="testimonialCard" tabIndex={0} aria-label="Testimonio de Camila R.">
                <h3 className="testimonialPerson" tabIndex={0}>Camila R.</h3>
                <span className="stars" role="img" aria-label="Calificación 5 de 5">
                  ★★★★★
                </span>
                <p className="testimonialText" tabIndex={0}>
                  “Me gustó el modo accesible. Las etiquetas y símbolos hacen que sea disfrutable incluso si confundo algunos colores.”
                </p>
              </article>
            </div>

            <button className="backTop" onClick={scrollToTop} aria-label="Volver arriba">
              ▲
            </button>

            <footer className="footer">COLORQUIZZ</footer>
          </section>
        </main>
      </div>

      {openSettings && (
        <SettingsModal
          value={settings}
          onChange={setSettings}
          onClose={() => setOpenSettings(false)}
          onReset={reset}
        />
      )}
    </div>
  );
}
