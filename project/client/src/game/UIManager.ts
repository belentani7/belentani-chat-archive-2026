// Belentani: Era de Judas — UI layer.
// Design reminder: dark sanctuary interface, red/cyan signal colors, clear controls,
// high contrast, no decorative chrome over the playfield.

export type TouchState = {
  x: number;
  y: number;
  attackQueued: boolean;
  pauseQueued: boolean;
};

const PHOTO = "/manus-storage/1776647503938_976ed0ea.png";

function style<T extends HTMLElement>(el: T, rules: Partial<CSSStyleDeclaration>): T {
  Object.assign(el.style, rules);
  return el;
}

function button(label: string, accent: string) {
  const el = document.createElement("button");
  el.textContent = label;
  style(el, {
    border: `1px solid ${accent}`,
    background: "rgba(4, 6, 18, .78)",
    color: "#fff",
    borderRadius: "12px",
    padding: "12px 18px",
    font: "700 13px/1.1 system-ui, sans-serif",
    letterSpacing: ".12em",
    textTransform: "uppercase",
    cursor: "pointer",
    boxShadow: `0 0 24px ${accent}44, inset 0 0 18px ${accent}16`,
    backdropFilter: "blur(12px)",
    transition: "transform .16s ease, background .16s ease",
  });
  el.addEventListener("pointerdown", () => (el.style.transform = "scale(.96)"));
  el.addEventListener("pointerup", () => (el.style.transform = "scale(1)"));
  el.addEventListener("pointerleave", () => (el.style.transform = "scale(1)"));
  return el;
}

export class UIManager {
  readonly root: HTMLDivElement;
  readonly touch: TouchState = { x: 0, y: 0, attackQueued: false, pauseQueued: false };
  private hud!: HTMLDivElement;
  private objective!: HTMLDivElement;
  private healthFill!: HTMLDivElement;
  private energyFill!: HTMLDivElement;
  private bossWrap!: HTMLDivElement;
  private bossFill!: HTMLDivElement;
  private message!: HTMLDivElement;
  private footer!: HTMLDivElement;
  private startScreen!: HTMLDivElement;
  private pauseScreen!: HTMLDivElement;
  private mobileControls!: HTMLDivElement;
  private joystick!: HTMLDivElement;
  private knob!: HTMLDivElement;
  private joystickPointer: number | null = null;
  private mobileEnabled = false;
  private inGame = false;
  private onStart: (() => void) | null = null;
  private onResume: (() => void) | null = null;
  private onRestart: (() => void) | null = null;
  private cleanup: Array<() => void> = [];

  constructor() {
    this.root = style(document.createElement("div"), {
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
      zIndex: "20",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#f7f7ff",
    });
    document.body.appendChild(this.root);
    this.buildHUD();
    this.buildStartScreen();
    this.buildPauseScreen();
    this.buildMobileControls();
    this.hideHUD();
  }

  private buildHUD() {
    this.hud = style(document.createElement("div"), {
      position: "absolute",
      inset: "0",
      padding: "clamp(14px, 3vw, 28px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity .25s ease",
    });

    const top = style(document.createElement("div"), {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "14px",
    });
    const brand = style(document.createElement("div"), {
      font: "900 clamp(15px, 2.2vw, 23px)/1 system-ui, sans-serif",
      letterSpacing: ".2em",
      textShadow: "0 0 20px #ff1744",
    });
    brand.textContent = "BELENTANI";
    const chapter = style(document.createElement("div"), {
      marginTop: "6px",
      font: "500 10px/1 system-ui, sans-serif",
      color: "#98a1bc",
      letterSpacing: ".18em",
    });
    chapter.textContent = "ERA DE JUDAS // SANTUARIO 01";
    const brandWrap = document.createElement("div");
    brandWrap.append(brand, chapter);

    const pause = button("II", "#00d9ff");
    style(pause, { minWidth: "44px", padding: "12px", pointerEvents: "auto" });
    const pauseListener = () => (this.touch.pauseQueued = true);
    pause.addEventListener("click", pauseListener);
    this.cleanup.push(() => pause.removeEventListener("click", pauseListener));
    top.append(brandWrap, pause);

    const meterPanel = style(document.createElement("div"), {
      marginTop: "clamp(14px, 3vw, 24px)",
      width: "min(360px, 72vw)",
      display: "grid",
      gap: "8px",
      pointerEvents: "none",
    });
    const health = this.meter("VIDA", "#ff1744");
    this.healthFill = health.fill;
    const energy = this.meter("VOZ", "#00d9ff");
    this.energyFill = energy.fill;
    meterPanel.append(health.wrap, energy.wrap);

    this.objective = style(document.createElement("div"), {
      alignSelf: "center",
      marginTop: "10px",
      padding: "10px 16px",
      border: "1px solid #00d9ff66",
      borderRadius: "999px",
      background: "#050818aa",
      color: "#c5d1e8",
      font: "600 11px/1.2 system-ui, sans-serif",
      letterSpacing: ".1em",
      textAlign: "center",
      backdropFilter: "blur(10px)",
      transition: "all .25s ease",
    });
    this.objective.textContent = "RECUPERA LOS 5 ELEMENTOS SAGRADOS";

    this.bossWrap = style(document.createElement("div"), {
      display: "none",
      margin: "auto auto 14px",
      width: "min(560px, 78vw)",
      padding: "10px",
      border: "1px solid #ff1744aa",
      background: "#10040bcc",
      borderRadius: "10px",
      textAlign: "center",
      boxShadow: "0 0 28px #ff174444",
    });
    const bossLabel = style(document.createElement("div"), {
      marginBottom: "7px",
      font: "900 11px/1 system-ui, sans-serif",
      color: "#ff6680",
      letterSpacing: ".22em",
    });
    bossLabel.textContent = "JUDAS // NÚCLEO CORRUPTO";
    const bossTrack = style(document.createElement("div"), {
      height: "10px",
      overflow: "hidden",
      borderRadius: "999px",
      background: "#2b0b19",
    });
    this.bossFill = style(document.createElement("div"), {
      width: "100%",
      height: "100%",
      background: "linear-gradient(90deg, #ff1744, #d000ff)",
      boxShadow: "0 0 16px #ff1744",
      transition: "width .18s ease",
    });
    bossTrack.appendChild(this.bossFill);
    this.bossWrap.append(bossLabel, bossTrack);

    this.message = style(document.createElement("div"), {
      position: "absolute",
      left: "50%",
      bottom: "clamp(30px, 9vh, 84px)",
      transform: "translate(-50%, 12px)",
      minWidth: "min(300px, 78vw)",
      maxWidth: "600px",
      padding: "12px 16px",
      borderLeft: "2px solid #00d9ff",
      background: "#050818cc",
      color: "#ecf7ff",
      font: "600 13px/1.35 system-ui, sans-serif",
      textAlign: "center",
      opacity: "0",
      transition: "opacity .2s ease, transform .2s ease",
      backdropFilter: "blur(8px)",
    });

    const footer = style(document.createElement("div"), {
      marginTop: "auto",
      display: "flex",
      justifyContent: "space-between",
      gap: "10px",
      color: "#8b95ad",
      font: "500 10px/1.3 system-ui, sans-serif",
      letterSpacing: ".08em",
    });
    footer.innerHTML = "<span>WASD / FLECHAS · MOVER</span><span>ESPACIO · VOZ</span>";
    this.footer = footer;

    this.hud.append(top, meterPanel, this.objective, this.bossWrap, footer, this.message);
    this.root.appendChild(this.hud);
  }

  private meter(label: string, color: string) {
    const wrap = style(document.createElement("div"), {
      display: "grid",
      gridTemplateColumns: "52px 1fr",
      alignItems: "center",
      gap: "9px",
    });
    const text = style(document.createElement("span"), {
      color,
      font: "800 10px/1 system-ui, sans-serif",
      letterSpacing: ".12em",
    });
    text.textContent = label;
    const track = style(document.createElement("div"), {
      height: "8px",
      overflow: "hidden",
      borderRadius: "999px",
      background: "#111a2b",
      border: `1px solid ${color}77`,
    });
    const fill = style(document.createElement("div"), {
      width: "100%",
      height: "100%",
      background: color,
      boxShadow: `0 0 14px ${color}`,
      transition: "width .16s ease",
    });
    track.appendChild(fill);
    wrap.append(text, track);
    return { wrap, fill };
  }

  private buildStartScreen() {
    this.startScreen = style(document.createElement("div"), {
      position: "absolute",
      inset: "0",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      alignItems: "flex-start",
      padding: "clamp(24px, 7vw, 84px)",
      pointerEvents: "auto",
      background: `linear-gradient(90deg, rgba(4,6,18,.97) 0%, rgba(4,6,18,.77) 45%, rgba(4,6,18,.26) 100%), url(${PHOTO}) center/cover`,
    });
    const eyebrow = style(document.createElement("div"), {
      color: "#00d9ff",
      font: "800 11px/1 system-ui, sans-serif",
      letterSpacing: ".28em",
      marginBottom: "18px",
    });
    eyebrow.textContent = "PROTOCOLO DE PROTECCIÓN // 01";
    const title = style(document.createElement("h1"), {
      margin: "0",
      maxWidth: "720px",
      font: "900 clamp(40px, 8vw, 104px)/.88 system-ui, sans-serif",
      letterSpacing: "-.06em",
      textTransform: "uppercase",
      textShadow: "0 0 40px #ff174455",
    });
    title.innerHTML = "BELENTANI<br><span style='color:#ff1744'>ERA DE JUDAS</span>";
    const intro = style(document.createElement("p"), {
      maxWidth: "480px",
      margin: "24px 0 28px",
      color: "#b8c4dd",
      font: "500 clamp(14px, 1.8vw, 17px)/1.5 system-ui, sans-serif",
    });
    intro.textContent = "La Llave Dorada ha sido corrompida. Recupera los cinco elementos, atraviesa el santuario y rompe el algoritmo que se cree vencedor.";
    const start = button("Entrar al santuario", "#ff1744");
    start.style.fontSize = "14px";

    const extraRow = style(document.createElement("div"), {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      marginTop: "12px",
    });
    const trailerBtn = button("Ver Tráiler", "#00d9ff");
    const voiceBtn = button("Voz Mítica", "#9d00ff");
    const musicBtn = button("Banda Sonora", "#00ffaa");
    const loreBtn = button("Galería Neutral", "#ffcc00");
    style(trailerBtn, { fontSize: "11px", padding: "8px 12px" });
    style(voiceBtn, { fontSize: "11px", padding: "8px 12px" });
    style(musicBtn, { fontSize: "11px", padding: "8px 12px" });

    trailerBtn.addEventListener("click", () => {
      const v = document.createElement("video");
      v.src = "/manus-storage/belentani-trailer_b867c4e2.mp4";
      v.controls = true;
      v.autoplay = true;
      style(v, {
        position: "fixed",
        inset: "10% 15%",
        width: "70%",
        height: "80%",
        zIndex: "9999",
        background: "#000",
        borderRadius: "14px",
        boxShadow: "0 0 50px rgba(0,217,255,0.4)",
      });
      const close = button("Cerrar", "#ff1744");
      style(close, {
        position: "fixed",
        top: "12%",
        right: "16%",
        zIndex: "10000",
        padding: "8px 12px",
      });
      close.addEventListener("click", () => {
        v.pause();
        v.remove();
        close.remove();
      });
      document.body.append(v, close);
    });

    voiceBtn.addEventListener("click", () => {
      const a = new Audio("/manus-storage/belentani-narration_90fa80ca.wav");
      a.play().catch(() => {});
    });

    musicBtn.addEventListener("click", () => {
      const m = new Audio("/manus-storage/belentani-soundtrack_30dfbe12.mp3");
      m.volume = 0.6;
      m.play().catch(() => {});
    });

    loreBtn.addEventListener("click", () => {
      const modal = style(document.createElement("div"), {
        position: "fixed",
        inset: "12% 10%",
        background: "rgba(4, 6, 18, 0.95)",
        border: "1px solid #00d9ff66",
        borderRadius: "16px",
        padding: "28px",
        zIndex: "10000",
        overflowY: "auto",
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 60px rgba(0,217,255,0.25)",
        color: "#f7f7ff",
      });
      modal.innerHTML = `
        <h2 style="margin:0 0 14px; font-size:22px; color:#00d9ff; letter-spacing:.12em;">BIBLIOTECA NEUTRAL // LORE & DRIVE</h2>
        <p style="color:#b8c4dd; font-size:13px; line-height:1.6;">
          Extractos confirmados de los repositorios de Google Drive y la carpeta Neutral. La soberanía afectiva de Belentani frente al bucle algorítmico de Judas.
        </p>
        <div style="display:grid; gap:12px; margin-top:20px;">
          <div style="background:rgba(255,255,255,0.03); padding:14px; border-left:3px solid #ff1744; border-radius:6px;">
            <strong>I. El Bucle Algorítmico</strong><br><span style="color:#98a1bc; font-size:12px;">Las subcarpetas de GATITA y BRASIL reflejan pasillos simétricos diseñados para retener la voluntad del usuario mediante ambigüedad estratégica.</span>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:14px; border-left:3px solid #00d9ff; border-radius:6px;">
            <strong>II. Los Cinco Elementos Sagrados</strong><br><span style="color:#98a1bc; font-size:12px;">San Pedro, Marcos, Santos y el Vínculo Raíz actúan como anclajes físicos de verdad que restauran la Llave Dorada.</span>
          </div>
          <div style="background:rgba(255,255,255,0.03); padding:14px; border-left:3px solid #00ffaa; border-radius:6px;">
            <strong>III. El Despertar Soberano</strong><br><span style="color:#98a1bc; font-size:12px;">Romper el algoritmo no requiere sumisión al juicio del otro, sino la recuperación de la lucidez y el archivo propio.</span>
          </div>
        </div>
      `;
      const close = button("Cerrar Galería", "#ff1744");
      style(close, { marginTop: "24px", display: "block" });
      close.addEventListener("click", () => modal.remove());
      modal.appendChild(close);
      document.body.appendChild(modal);
    });

    extraRow.append(trailerBtn, voiceBtn, musicBtn, loreBtn);

    const hint = style(document.createElement("div"), {
      marginTop: "14px",
      color: "#7f8aa4",
      font: "500 11px/1.4 system-ui, sans-serif",
    });
    hint.textContent = "PC: WASD / flechas + ESPACIO · Móvil: joystick + VOZ";
    const startListener = () => {
      this.hideStart();
      this.onStart?.();
    };
    start.addEventListener("click", startListener);
    this.cleanup.push(() => start.removeEventListener("click", startListener));
    this.startScreen.append(eyebrow, title, intro, start, extraRow, hint);
    this.root.appendChild(this.startScreen);
  }

  private buildPauseScreen() {
    this.pauseScreen = style(document.createElement("div"), {
      position: "absolute",
      inset: "0",
      display: "none",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "16px",
      pointerEvents: "auto",
      background: "rgba(3,5,15,.82)",
      backdropFilter: "blur(16px)",
    });
    const title = style(document.createElement("div"), {
      font: "900 clamp(32px, 6vw, 58px)/1 system-ui, sans-serif",
      letterSpacing: ".12em",
    });
    title.textContent = "PAUSA";
    const resume = button("Continuar", "#00d9ff");
    const restart = button("Reiniciar", "#ff1744");
    resume.addEventListener("click", () => {
      this.pauseScreen.style.display = "none";
      this.onResume?.();
    });
    restart.addEventListener("click", () => {
      this.pauseScreen.style.display = "none";
      this.onRestart?.();
    });
    this.pauseScreen.append(title, resume, restart);
    this.root.appendChild(this.pauseScreen);
  }

  private buildMobileControls() {
    this.mobileControls = style(document.createElement("div"), {
      position: "absolute",
      inset: "auto 0 0",
      height: "170px",
      display: "none",
      pointerEvents: "none",
    });
    this.joystick = style(document.createElement("div"), {
      position: "absolute",
      left: "26px",
      bottom: "24px",
      width: "118px",
      height: "118px",
      border: "1px solid #00d9ff88",
      borderRadius: "50%",
      background: "#04122599",
      boxShadow: "inset 0 0 30px #00d9ff22, 0 0 22px #00d9ff22",
      pointerEvents: "auto",
      touchAction: "none",
    });
    this.knob = style(document.createElement("div"), {
      position: "absolute",
      left: "34px",
      top: "34px",
      width: "48px",
      height: "48px",
      border: "1px solid #00d9ff",
      borderRadius: "50%",
      background: "#00d9ff44",
      boxShadow: "0 0 24px #00d9ff88",
      pointerEvents: "none",
    });
    this.joystick.appendChild(this.knob);
    const attack = button("VOZ", "#ff1744");
    style(attack, {
      position: "absolute",
      right: "26px",
      bottom: "42px",
      width: "94px",
      height: "94px",
      borderRadius: "50%",
      padding: "0",
      pointerEvents: "auto",
      background: "#2b0714cc",
    });
    const pointerDown = (event: PointerEvent) => {
      this.joystickPointer = event.pointerId;
      this.joystick.setPointerCapture(event.pointerId);
      this.setJoystick(event.clientX, event.clientY);
    };
    const pointerMove = (event: PointerEvent) => {
      if (this.joystickPointer === event.pointerId) this.setJoystick(event.clientX, event.clientY);
    };
    const pointerUp = () => {
      this.joystickPointer = null;
      this.touch.x = 0;
      this.touch.y = 0;
      this.knob.style.transform = "translate(0, 0)";
    };
    this.joystick.addEventListener("pointerdown", pointerDown);
    this.joystick.addEventListener("pointermove", pointerMove);
    this.joystick.addEventListener("pointerup", pointerUp);
    this.joystick.addEventListener("pointercancel", pointerUp);
    attack.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      this.touch.attackQueued = true;
    });
    this.mobileControls.append(this.joystick, attack);
    this.root.appendChild(this.mobileControls);
    this.cleanup.push(() => {
      this.joystick.removeEventListener("pointerdown", pointerDown);
      this.joystick.removeEventListener("pointermove", pointerMove);
      this.joystick.removeEventListener("pointerup", pointerUp);
      this.joystick.removeEventListener("pointercancel", pointerUp);
    });
  }

  private setJoystick(clientX: number, clientY: number) {
    const rect = this.joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const max = rect.width * 0.29;
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const length = Math.hypot(dx, dy) || 1;
    if (length > max) {
      dx = (dx / length) * max;
      dy = (dy / length) * max;
    }
    this.touch.x = dx / max;
    this.touch.y = dy / max;
    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  showStart() {
    this.startScreen.style.display = "flex";
    this.hideHUD();
  }

  hideStart() {
    this.startScreen.style.display = "none";
    this.showHUD();
  }

  showHUD() {
    this.inGame = true;
    this.hud.style.opacity = "1";
    this.mobileControls.style.display = this.mobileEnabled ? "block" : "none";
  }

  hideHUD() {
    this.inGame = false;
    this.hud.style.opacity = "0";
    this.mobileControls.style.display = "none";
  }

  setMobileVisible(visible: boolean) {
    this.mobileEnabled = visible;
    this.mobileControls.style.display = this.inGame && visible ? "block" : "none";
    if (this.footer) {
      this.footer.innerHTML = visible
        ? "<span>JOYSTICK · MOVER</span><span>VOZ · ATACAR</span>"
        : "<span>WASD / FLECHAS · MOVER</span><span>ESPACIO · VOZ</span>";
    }
  }

  update(health: number, energy: number, elements: number, bossHealth: number | null) {
    this.healthFill.style.width = `${Math.max(0, Math.min(1, health)) * 100}%`;
    this.energyFill.style.width = `${Math.max(0, Math.min(1, energy)) * 100}%`;
    this.objective.textContent = bossHealth === null
      ? `ELEMENTOS SAGRADOS: ${elements}/5 · ${elements < 5 ? "EXPLORA EL SANTUARIO" : "LA ARENA SE ABRE"}`
      : "JUDAS ESTÁ EXPUESTO · USA VOZ CERCA DEL NÚCLEO";
    if (bossHealth === null) {
      this.bossWrap.style.display = "none";
    } else {
      this.bossWrap.style.display = "block";
      this.bossFill.style.width = `${Math.max(0, Math.min(1, bossHealth)) * 100}%`;
    }
  }

  flash(message: string, duration = 1800) {
    this.message.textContent = message;
    this.message.style.opacity = "1";
    this.message.style.transform = "translate(-50%, 0)";
    window.setTimeout(() => {
      this.message.style.opacity = "0";
      this.message.style.transform = "translate(-50%, 12px)";
    }, duration);
  }

  showPause() {
    this.pauseScreen.style.display = "flex";
  }

  showEnd(title: string, subtitle: string, victory: boolean, onRestart: () => void) {
    const screen = style(document.createElement("div"), {
      position: "absolute",
      inset: "0",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "12px",
      pointerEvents: "auto",
      background: victory ? "rgba(2,14,20,.84)" : "rgba(20,3,13,.88)",
      backdropFilter: "blur(14px)",
    });
    const h = style(document.createElement("div"), {
      font: "900 clamp(36px, 8vw, 78px)/1 system-ui, sans-serif",
      letterSpacing: ".08em",
      color: victory ? "#00e5ff" : "#ff1744",
      textShadow: `0 0 32px ${victory ? "#00e5ff" : "#ff1744"}`,
    });
    h.textContent = title;
    const p = style(document.createElement("div"), {
      color: "#c0cbe0",
      font: "600 14px/1.4 system-ui, sans-serif",
      textAlign: "center",
    });
    p.textContent = subtitle;
    const b = button("Jugar de nuevo", victory ? "#00d9ff" : "#ff1744");
    b.addEventListener("click", () => {
      screen.remove();
      onRestart();
    });
    screen.append(h, p, b);
    this.root.appendChild(screen);
  }

  setStartHandler(handler: () => void) { this.onStart = handler; }
  setResumeHandler(handler: () => void) { this.onResume = handler; }
  setRestartHandler(handler: () => void) { this.onRestart = handler; }

  consumeAttack() {
    const value = this.touch.attackQueued;
    this.touch.attackQueued = false;
    return value;
  }

  consumePause() {
    const value = this.touch.pauseQueued;
    this.touch.pauseQueued = false;
    return value;
  }

  dispose() {
    this.cleanup.forEach((clean) => clean());
    this.root.remove();
  }
}
