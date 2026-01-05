import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import SettingsModal from "../components/SettingsModal";
import palette from "../assets/images/palette.png"; 

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
              <span className="heroQ">¿Tienes daltonismo?</span>
              <h1 className="heroTitle">HACER PRUEBA</h1>
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
  <header className="instructionsHeader">
    <div className="helpIcon" aria-hidden="true">?</div>
    <h2 className="instructionsTitle">Instrucciones</h2>
  </header>

  <div className="instructionsLayout">
    <img
      className="instructionsImg"
      src={palette}
      alt="Rueda de colores"
      draggable="false"
    />

    <div className="instructionsCard">
      <ol className="instructionsList">
        <li>
          Presiona <strong>“Comenzar”</strong> en la pantalla principal para iniciar el juego.
        </li>
        <li>
          Debes <strong>identificar</strong> colores, símbolos o patrones según lo que se indique.
        </li>
        <li>
          Si tienes <strong>daltonismo</strong>, activa el modo accesible para ver símbolos y etiquetas junto a los colores.
        </li>
        <li>
          Recibe <strong>retroalimentación</strong>:
          <ul>
            <li>Si <strong>aciertas</strong>, verás el ícono de éxito o escucharás un sonido.</li>
            <li>Si <strong>fallas</strong>, se mostrará un mensaje o un símbolo que lo indique.</li>
          </ul>
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
>
  <h2 className="sectionTitle profileTitle">Perfil Visual</h2>

  <div className="profileStack">
    {/* Card 1 */}
    <article className="profileCard">
      <h3 className="profileCardTitle">¿Qué es el daltonismo?</h3>
      <p className="profileText">
        Si usted tiene daltonismo (deficiencia en la visión de los colores),
        significa que ve los colores de manera diferente a la mayoría de las
        personas. El daltonismo casi siempre hace difícil notar la diferencia
        entre ciertos colores.
      </p>
    </article>

    {/* Card 2 */}
    <article className="profileCard">
      <h3 className="profileCardTitle">¿Corro riesgo de presentar daltonismo?</h3>
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
    </article>

    {/* Card 3 */}
    <article className="profileCard">
      <h3 className="profileCardTitle">Tipos de daltonismo</h3>

      <p className="profileText">
        El daltonismo rojo-verde es el más común e incluye:
      </p>
      <ul className="profileBullets">
        <li><strong>Deuteranomalía:</strong> el verde se ve rojizo (leve).</li>
        <li><strong>Protanomalía:</strong> el rojo se ve verdoso y menos brillante (leve).</li>
        <li><strong>Protanopia y deuteranopia:</strong> no se distingue entre rojo y verde.</li>
      </ul>

      <p className="profileText">
        El daltonismo azul-amarillo es menos común e incluye:
      </p>
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
>
  <h2 className="sectionTitle testimonialsTitle">Testimonios</h2>

  <div className="testimonialsStack">
    <article className="testimonialCard">
      <h3 className="testimonialPerson">Valeria P.</h3>
      <div className="stars" aria-label="Calificación 5 de 5">★★★★★</div>
      <p className="testimonialText">
        “Muy útil para entender mi visión. Me ayudó a identificar patrones y a sentirme más segura usando el modo accesible.”
      </p>
    </article>

    <article className="testimonialCard">
      <h3 className="testimonialPerson">Diego M.</h3>
      <div className="stars" aria-label="Calificación 4 de 5">★★★★☆</div>
      <p className="testimonialText">
        “La interfaz es clara y rápida. Me gustó que el feedback sea inmediato y que todo esté explicado sin abrumar.”
      </p>
    </article>

    <article className="testimonialCard">
      <h3 className="testimonialPerson">Camila R.</h3>
      <div className="stars" aria-label="Calificación 5 de 5">★★★★★</div>
      <p className="testimonialText">
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
