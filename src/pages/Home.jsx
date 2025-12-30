import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";

const DEFAULTS = { colorBlind: false, contrast: 100, brightness: 100 };

export default function Home() {
  const homeRef = useRef(null);
  const instructionsRef = useRef(null);
  const profileRef = useRef(null);
  const testimonialsRef = useRef(null);

  const [openSettings, setOpenSettings] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("settings");
    return saved ? JSON.parse(saved) : DEFAULTS;
  });

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  const styleVars = useMemo(
    () => ({
      "--contrast": `${settings.contrast}%`,
      "--brightness": `${settings.brightness}%`,
      "--cb-filter": settings.colorBlind ? "saturate(0.75)" : "none",
    }),
    [settings]
  );

  const reset = () => setSettings(DEFAULTS);

  // Detectar sección visible (incluye HOME para limpiar tabs al volver arriba)
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
      { rootMargin: "-35% 0px -55% 0px", threshold: [0.05, 0.15, 0.3, 0.5] }
    );

    items.forEach((it) => obs.observe(it.el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (section) => {
    const map = {
      home: homeRef.current,
      instructions: instructionsRef.current,
      profile: profileRef.current,
      testimonials: testimonialsRef.current,
    };
    map[section]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToTop = () => scrollTo("home");

  return (
    <div className="app" style={styleVars}>
      <Navbar onOpenSettings={() => setOpenSettings(true)} />

      <main className="page">
        {/* PANTALLA 1: HERO + TABS */}
        <section
          ref={homeRef}
          data-section="home"
          className="screen screen-home"
        >
          <div className="hero">
            <div className="heroBox">
              <p className="heroQ">¿Tienes daltonismo?</p>
              <h2 className="heroTitle">HACER PRUEBA</h2>
              <button className="primaryBtn">COMENZAR</button>
            </div>
          </div>

          <div className="tabs">
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

        {/* PANTALLA 2 */}
        <section
          ref={instructionsRef}
          data-section="instructions"
          className="screen screen-instructions"
        >
          <h3 className="sectionTitle">Instrucciones</h3>
          <div className="card">
            <ol>
              <li>
                Presiona “Comenzar” en la pantalla principal para iniciar el
                juego.
              </li>
              <li>
                Debes identificar colores, símbolos o patrones según lo que se
                indique.
              </li>
              <li>
                Si tienes daltonismo, activa el modo accesible para ver símbolos
                y etiquetas.
              </li>
              <li>
                Recibe retroalimentación:
                <ul>
                  <li>
                    Si aciertas, verás un icono de éxito o escucharás un sonido.
                  </li>
                  <li>
                    Si fallas, se mostrará un mensaje o un símbolo que lo
                    indique.
                  </li>
                </ul>
              </li>
            </ol>
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
        >
          <h3 className="sectionTitle">Perfil Visual</h3>
          <div className="card">
            <h4>¿Qué es el daltonismo?</h4>
            <p>
              Es una condición donde ciertas diferencias de color pueden ser
              difíciles de percibir. (Aquí va tu texto real).
            </p>
            <h4>Tipos</h4>
            <p>Deuteranopia, Protanopia, Tritanopia…</p>
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
        >
          <h3 className="sectionTitle">Testimonios</h3>
          <div className="card">
            <p>⭐️⭐️⭐️⭐️⭐️ “Muy útil para entender mi visión.”</p>
            <hr />
            <p>⭐️⭐️⭐️⭐️ “La interfaz es clara y rápida.”</p>
            <hr />
            <p>⭐️⭐️⭐️⭐️⭐️ “Me gustó el modo accesible.”</p>
          </div>

          <button className="backTop" onClick={scrollToTop} aria-label="Volver arriba">
            ▲
          </button>
        </section>

        <footer className="footer">COLORQUIZZ</footer>
      </main>

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
