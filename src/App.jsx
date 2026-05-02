import { useEffect, useMemo, useRef, useState } from "react";
import emailjs, { EmailJSResponseStatus } from "@emailjs/browser";
import {
  ArrowRight,
  Disc3,
  ExternalLink,
  Lock,
  Mail,
  MapPin,
  Menu,
  Mic2,
  Music2,
  MessageSquare,
  Pencil,
  Phone,
  Play,
  Plus,
  Radio,
  Save,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { NavLink, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  adminLogin,
  adminLogout,
  createArtist,
  createMessage,
  createRelease,
  deleteArtist,
  deleteRelease,
  getAdminContent,
  getAdminMessages,
  getPublicContent,
  updateArtist,
  updateRelease,
} from "./lib/api";

const heroImage = "/assets/hero-main.webp";
const aboutImage = "/assets/our-story.jpg";
const brandMark = "/assets/logo.jpeg";
const whoWeAreImage = "/assets/who-we-are.jpg";
const contactEmail = "info@cityplug.com";
const instagramUrl =
  "https://www.instagram.com/cityplug_entertainment?igsh=MTZrOXNzMWdza3Az";
const tiktokUrl =
  "https://www.tiktok.com/@cityplug_entertainment?_r=1&_t=ZS-95tfDeNbDin";
const emailJsServiceId =
  import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_2pp93kt";
const emailJsTemplateId =
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_lc7sdyi";
const emailJsPublicKey =
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "9SysWKdESH13Dvqrs";
const adminTokenKey = "cityplug-admin-token";
const adminMessageSignalKey = "cityplug-admin-message-signal";

const services = [
  {
    icon: Users,
    title: "Artist Development",
    description:
      "We nurture emerging talent through mentorship, training, and strategic career planning. From studio fundamentals to stage presence, we develop complete artists.",
  },
  {
    icon: Music2,
    title: "Music Production",
    description:
      "Access to world-class producers, state-of-the-art studios, and cutting-edge production techniques. We help you craft your signature sound.",
  },
  {
    icon: Sparkles,
    title: "Branding & Promotion",
    description:
      "Strategic branding, visual identity, and multi-platform promotion. We position you as a brand, not just a musician.",
  },
  {
    icon: Mic2,
    title: "Talent Discovery",
    description:
      "We scout, identify, and sign the next generation of African artists. If you have the talent, we have the platform.",
  },
  {
    icon: Radio,
    title: "Event & Booking Management",
    description:
      "From intimate studio sessions to major festival performances, we manage bookings and create unforgettable live experiences.",
  },
];

const values = [
  {
    number: "01",
    title: "Authenticity",
    text: "We celebrate raw, unfiltered talent. No compromises. No manufactured narratives. Just pure artistry rooted in real experiences.",
  },
  {
    number: "02",
    title: "Innovation",
    text: "We push boundaries. We experiment. We blend genres, cultures, and mediums to create something entirely new.",
  },
  {
    number: "03",
    title: "Community",
    text: "We build. We collaborate. We lift each other up. Cityplug is a family united by passion, creativity, and shared vision.",
  },
];

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Our Services" },
  { to: "/talent", label: "Artists" },
  { to: "/contact", label: "Contact" },
];

function defaultArtistForm() {
  return {
    name: "",
    image: "",
    role: "",
    bio: "",
    location: "",
    spotlight: "",
    featuredOnHome: false,
    socials: {
      instagram: "",
      tiktok: "",
      youtube: "",
    },
  };
}

function defaultReleaseForm() {
  return {
    title: "",
    slug: "",
    artistId: "",
    artistName: "",
    type: "",
    coverImage: "",
    summary: "",
    body: "",
    releaseDate: "",
    streamingUrl: "",
    featuredOnHome: false,
  };
}

function Reveal({
  as: Component = "div",
  children,
  className = "",
  variant = "fade",
  delay = 0,
  threshold = 0.18,
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Component
      ref={ref}
      className={`reveal reveal-${variant}${isVisible ? " is-visible" : ""}${
        className ? ` ${className}` : ""
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  );
}

function InstagramIcon({ size = 18 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.2" cy="6.8" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ size = 18 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.2 4v8.9a4.7 4.7 0 1 1-4.7-4.7" />
      <path d="M14.2 4c.85 2.1 2.8 3.78 4.95 4.25" />
      <path d="M14.2 7.3c1.35 1.18 3.03 1.84 4.8 1.9" />
    </svg>
  );
}

function YouTubeIcon({ size = 18 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.8 8.3A2.9 2.9 0 0 1 4.9 6.2c4.7-.7 9.5-.7 14.2 0a2.9 2.9 0 0 1 2.1 2.1c.6 2.5.6 4.9 0 7.4a2.9 2.9 0 0 1-2.1 2.1c-4.7.7-9.5.7-14.2 0a2.9 2.9 0 0 1-2.1-2.1 16.8 16.8 0 0 1 0-7.4Z" />
      <path d="m10 15 5-3-5-3Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function App() {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [content, setContent] = useState({ artists: [], releases: [] });
  const [loading, setLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(adminTokenKey) || "");
  const location = useLocation();

  useEffect(() => {
    void refreshPublicContent();
  }, []);

  useEffect(() => {
    function syncAdminSession() {
      setAdminToken(localStorage.getItem(adminTokenKey) || "");
    }

    window.addEventListener("storage", syncAdminSession);
    return () => window.removeEventListener("storage", syncAdminSession);
  }, []);

  async function refreshPublicContent() {
    setLoading(true);
    setContentError("");

    try {
      const nextContent = await getPublicContent();
      setContent(nextContent);
    } catch (error) {
      setContentError(error.message || "Unable to load site content.");
    } finally {
      setLoading(false);
    }
  }

  const releaseMap = useMemo(
    () =>
      Object.fromEntries(
        content.releases.map((release) => [release.artistId, release])
      ),
    [content.releases]
  );

  const hidePublicChrome = location.pathname === "/admin" && !adminToken;

  return (
    <div className="site-shell">
      <ScrollToTop />
      {!hidePublicChrome ? <Navbar /> : null}
      <main className={`main-shell${hidePublicChrome ? " main-shell-no-chrome" : ""}`}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                artists={content.artists}
                releases={content.releases}
                loading={loading}
                error={contentError}
                onArtistSelect={setSelectedArtist}
              />
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route
            path="/talent"
            element={
              <TalentPage
                artists={content.artists}
                loading={loading}
                error={contentError}
                onArtistSelect={setSelectedArtist}
              />
            }
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/admin"
            element={
              <AdminPage
                content={content}
                onContentChange={setContent}
                adminToken={adminToken}
                onAdminTokenChange={setAdminToken}
              />
            }
          />
          <Route
            path="/releases/:slug"
            element={<ReleasePage releases={content.releases} loading={loading} />}
          />
        </Routes>
      </main>
      {!hidePublicChrome ? <Footer /> : null}
      <ArtistModal
        artist={selectedArtist}
        release={selectedArtist ? releaseMap[selectedArtist.id] : null}
        onClose={() => setSelectedArtist(null)}
      />
    </div>
  );
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="navbar">
      <div className="container nav-row">
        <NavLink to="/" className="brand">
          <img src={brandMark} alt="Cityplug logo" className="brand-mark" />
          <span className="brand-text">CITYPLUG</span>
        </NavLink>
        <nav className="desktop-nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
        <button
          className="mobile-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {menuOpen ? (
        <nav className="mobile-nav" aria-label="Mobile">
          <div className="container mobile-nav-inner">
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} mobile />
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function NavItem({ to, label, mobile = false }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${mobile ? "mobile-nav-link" : "nav-link"}${isActive ? " is-active" : ""}`
      }
    >
      <span>{label}</span>
      {!mobile ? <span className="nav-underline" /> : null}
    </NavLink>
  );
}

function HomePage({ artists, releases, loading, error, onArtistSelect }) {
  const featuredArtists = artists.filter((artist) => artist.featuredOnHome).slice(0, 3);
  const featuredReleases = releases.filter((release) => release.featuredOnHome).slice(0, 3);

  return (
    <>
      <Seo
        title="Cityplug Records | The Sound of the Streets"
        description="Discover Cityplug artists, latest releases, and the creative movement shaping new sounds from Lagos to the world."
      />
      <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero-overlay" />
        <div className="container hero-content">
          <Reveal as="h1" variant="slide-up">
            THE SOUND OF THE STREETS
          </Reveal>
          <Reveal as="p" variant="fade" delay={120}>
            Discover raw talent. Experience bold creativity. Join the movement.
          </Reveal>
          <Reveal className="hero-actions" variant="scale" delay={220}>
            <NavLink to="/talent" className="button button-primary">
              Explore Talent
            </NavLink>
            <button type="button" className="button button-ghost">
              <Play size={18} />
              Listen Now
            </button>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <SectionIntro
          title="Artist"
          text="Meet the artists pushing boundaries and defining the sound of a generation."
          accent
        />
        <ContentState loading={loading} error={error} empty={!featuredArtists.length} emptyText="No featured artists have been added yet.">
          <div className="container artist-grid">
            {featuredArtists.map((artist, index) => (
              <Reveal key={artist.id} variant="slide-up" delay={index * 90}>
                <ArtistCard artist={artist} onSelect={onArtistSelect} />
              </Reveal>
            ))}
          </div>
        </ContentState>
        <Reveal className="section-link-wrap" variant="fade" delay={180}>
          <NavLink to="/talent" className="text-link">
            View All Artists <ArrowRight size={18} />
          </NavLink>
        </Reveal>
      </section>

      <section className="section section-muted">
        <SectionIntro
          title="Latest Releases"
          text="Fresh music from our roster. Stream now on all platforms."
        />
        <ContentState loading={loading} error={error} empty={!featuredReleases.length} emptyText="No featured releases have been added yet.">
          <div className="container release-grid">
            {featuredReleases.map((release, index) => (
              <Reveal key={release.id} variant="scale" delay={index * 100}>
                <ReleaseCard release={release} />
              </Reveal>
            ))}
          </div>
        </ContentState>
      </section>

      <section className="section">
        <div className="container split-layout">
          <Reveal variant="slide-up">
            <h2 className="section-heading">Who We Are</h2>
            <p className="body-copy">
              Cityplug Records is more than a record label. We&apos;re a movement
              dedicated to discovering and amplifying raw talent from Lagos and
              beyond. We celebrate authentic storytelling, bold creativity, and
              uncompromising artistry.
            </p>
            <p className="body-copy">
              Every artist we sign is a brand. Every release is a statement.
              Every collaboration is a revolution.
            </p>
            <NavLink to="/about" className="text-link">
              Learn Our Story <ArrowRight size={18} />
            </NavLink>
          </Reveal>
          <Reveal className="image-frame" variant="scale" delay={120}>
            <img src={whoWeAreImage} alt="Cityplug collective" loading="lazy" decoding="async" />
          </Reveal>
        </div>
      </section>

      <section className="section section-muted">
        <SectionIntro
          title="What We Offer"
          text="Comprehensive services to elevate your music career."
        />
        <div className="container service-preview-grid">
          {services.slice(0, 3).map((service, index) => (
            <Reveal key={service.title} variant="slide-up" delay={index * 90}>
              <article className="simple-card">
                <h3>{service.title}</h3>
                <p>{service.description.split(".")[0]}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal className="section-link-wrap" variant="fade" delay={180}>
          <NavLink to="/services" className="text-link">
            Explore All Services <ArrowRight size={18} />
          </NavLink>
        </Reveal>
      </section>

      <CtaBand
        title="Join Cityplug"
        text="Ready to take your music to the next level? Let's create something amazing together."
        buttonLabel="Get Started"
        buttonTo="/contact"
      />
    </>
  );
}

function AboutPage() {
  return (
    <>
      <Seo
        title="About Cityplug Records"
        description="Learn the mission, values, and movement behind Cityplug Records and its artist development platform."
      />
      <PageHero title="" subtitle="" image={aboutImage} />
      <section className="section">
        <Reveal className="container narrow-content" variant="slide-up">
          <h2 className="section-heading">Our Mission</h2>
          <p className="body-copy">
            Cityplug Records exists to discover, develop, and amplify the raw
            talent emerging from Lagos and beyond. We believe in the power of
            authentic storytelling, bold creativity, and uncompromising artistry.
            Our mission is to create a platform where emerging artists can
            thrive, collaborate, and reach global audiences without sacrificing
            their cultural identity.
          </p>
          <p className="body-copy">
            We are more than a record label. We are a movement. A celebration of
            Lagos street culture, contemporary fashion, and the next generation of
            African music. Every artist we sign is a brand. Every release is a
            statement. Every collaboration is a revolution.
          </p>
        </Reveal>
      </section>
      <section className="section section-muted">
        <SectionIntro title="Our Values" text="" />
        <div className="container value-grid">
          {values.map((value, index) => (
            <Reveal key={value.number} variant="scale" delay={index * 90}>
              <article className="value-card release-card">
                <div className="value-badge">{value.number}</div>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section">
        <Reveal className="container centered-copy" variant="fade">
          <h2 className="section-heading">Built for the Next Wave</h2>
          <p className="body-copy">
            We help artists turn momentum into movement with development, release
            strategy, and a stronger platform around every record.
          </p>
          <NavLink to="/contact" className="button button-primary">
            Get in Touch
          </NavLink>
        </Reveal>
      </section>
    </>
  );
}

function ServicesPage() {
  return (
    <>
      <Seo
        title="Cityplug Services"
        description="Explore Cityplug's artist development, music production, branding, talent discovery, and booking services."
      />
      <section className="page-header">
        <Reveal className="container centered-copy" variant="slide-up">
          <h1 className="page-title">What We Offer</h1>
          <p className="page-subtitle">
            Comprehensive services designed to elevate your music career and
            establish your presence in the global music industry.
          </p>
        </Reveal>
      </section>
      <section className="section">
        <div className="container service-grid">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.title} variant="slide-up" delay={index * 90}>
                <article className="service-card">
                  <div className="service-icon">
                    <Icon size={30} />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>
      <CtaBand
        title="Let's Build Your Sound"
        text="From talent discovery to release strategy, we help artists move with intention and impact."
        buttonLabel="Submit Your Demo"
        buttonTo="/contact"
      />
    </>
  );
}

function TalentPage({ artists, loading, error, onArtistSelect }) {
  return (
    <>
      <Seo
        title="Cityplug Artists"
        description="Meet the artists driving the Cityplug movement with bold releases, original stories, and standout performances."
      />
      <section className="page-header">
        <div className="container centered-copy">
          <h1 className="page-title page-title-accent">Artist</h1>
          <p className="page-subtitle">
            Meet the visionaries, hitmakers, and voices driving the Cityplug
            movement forward.
          </p>
        </div>
      </section>
      <section className="section">
        <ContentState loading={loading} error={error} empty={!artists.length} emptyText="No artists have been added yet.">
          <div className="container artist-grid artist-grid-large">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} onSelect={onArtistSelect} />
            ))}
          </div>
        </ContentState>
      </section>
      <section className="section section-muted">
        <div className="container centered-copy">
          <h2 className="section-heading">Have the Sound?</h2>
          <p className="body-copy">
            We&apos;re always looking for artists with fearless energy, original
            perspective, and records that deserve a bigger stage.
          </p>
          <NavLink to="/contact" className="button button-primary">
            Submit Your Demo
          </NavLink>
        </div>
      </section>
    </>
  );
}

function ReleasePage({ releases, loading }) {
  const { slug } = useParams();
  const release = releases.find((item) => item.slug === slug);

  if (loading) {
    return (
      <section className="page-header">
        <div className="container centered-copy">
          <p className="page-subtitle">Loading release...</p>
        </div>
      </section>
    );
  }

  if (!release) {
    return (
      <section className="page-header">
        <div className="container centered-copy">
          <h1 className="page-title">Release not found</h1>
          <p className="page-subtitle">
            This release page does not exist yet or has been removed.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <Seo
        title={`${release.title} | Cityplug Records`}
        description={release.summary}
      />
      <section className="page-header release-hero">
        <div className="container release-hero-grid">
          <div className="release-hero-cover">
            {release.coverImage ? (
              <img src={release.coverImage} alt={`${release.title} cover art`} loading="eager" decoding="async" />
            ) : (
              <div className="release-cover release-cover-fallback">
                <Disc3 size={72} />
              </div>
            )}
          </div>
          <div>
            <span className="pill">{release.type || "Release"}</span>
            <h1 className="page-title release-title">{release.title}</h1>
            <p className="page-subtitle release-subtitle">
              {release.artistName || "Cityplug Records"}
            </p>
            <p className="body-copy">{release.summary}</p>
            <div className="release-detail-meta">
              {release.releaseDate ? <span>Released {formatDate(release.releaseDate)}</span> : null}
              {release.streamingUrl ? (
                <a href={release.streamingUrl} target="_blank" rel="noreferrer" className="text-link">
                  Open streaming link <ExternalLink size={18} />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <Reveal className="container narrow-content" variant="slide-up">
          <h2 className="section-heading">Release Story</h2>
          <p className="body-copy">{release.body}</p>
        </Reveal>
      </section>
    </>
  );
}

function AdminPage({ content, onContentChange, adminToken, onAdminTokenChange }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [artistForm, setArtistForm] = useState(defaultArtistForm());
  const [releaseForm, setReleaseForm] = useState(defaultReleaseForm());
  const [editingArtistId, setEditingArtistId] = useState("");
  const [editingReleaseId, setEditingReleaseId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [dashboardError, setDashboardError] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeAdminSection, setActiveAdminSection] = useState("artists");

  useEffect(() => {
    if (!adminToken) {
      return;
    }

    void loadDashboardContent(adminToken);
    void loadMessages(adminToken);
  }, [adminToken]);

  useEffect(() => {
    if (!adminToken) {
      return undefined;
    }

    if (activeAdminSection === "messages") {
      void loadMessages(adminToken);
    }

    const intervalId = window.setInterval(() => {
      void loadMessages(adminToken);
    }, 10000);

    function handleWindowFocus() {
      void loadMessages(adminToken);
    }

    function handleStorage(event) {
      if (event.key === adminMessageSignalKey) {
        void loadMessages(adminToken);
      }
    }

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, [activeAdminSection, adminToken]);

  async function loadDashboardContent(activeToken) {
    try {
      const adminContent = await getAdminContent(activeToken);
      onContentChange(adminContent);
      setDashboardError("");
    } catch (error) {
      setDashboardError(error.message || "Unable to load admin content.");
      if (/unauthorized/i.test(error.message || "")) {
        localStorage.removeItem(adminTokenKey);
        onAdminTokenChange("");
      }
    }
  }

  async function loadMessages(activeToken) {
    try {
      const adminMessages = await getAdminMessages(activeToken);
      setMessages(adminMessages);
    } catch (error) {
      setDashboardError(error.message || "Unable to load messages.");
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setSubmitting(true);
    setAuthError("");

    try {
      const response = await adminLogin(email, password);
      localStorage.setItem(adminTokenKey, response.token);
      onAdminTokenChange(response.token);
      setEmail("");
      setPassword("");
    } catch (error) {
      setAuthError(error.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    if (adminToken) {
      try {
        await adminLogout(adminToken);
      } catch {
        // Ignore logout errors and clear local session anyway.
      }
    }

    localStorage.removeItem(adminTokenKey);
    onAdminTokenChange("");
    setStatusMessage("");
    setDashboardError("");
  }

  async function handleArtistSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setDashboardError("");

    try {
      if (editingArtistId) {
        await updateArtist(adminToken, editingArtistId, artistForm);
        setStatusMessage("Artist updated.");
      } else {
        await createArtist(adminToken, artistForm);
        setStatusMessage("Artist added.");
      }

      await loadDashboardContent(adminToken);
      setArtistForm(defaultArtistForm());
      setEditingArtistId("");
    } catch (error) {
      setDashboardError(error.message || "Unable to save artist.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReleaseSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setDashboardError("");

    try {
      const payload = {
        ...releaseForm,
        artistName:
          content.artists.find((artist) => artist.id === releaseForm.artistId)?.name ||
          releaseForm.artistName,
      };

      if (editingReleaseId) {
        await updateRelease(adminToken, editingReleaseId, payload);
        setStatusMessage("Release updated.");
      } else {
        await createRelease(adminToken, payload);
        setStatusMessage("Release added.");
      }

      await loadDashboardContent(adminToken);
      setReleaseForm(defaultReleaseForm());
      setEditingReleaseId("");
    } catch (error) {
      setDashboardError(error.message || "Unable to save release.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteArtist(artistId) {
    if (!window.confirm("Delete this artist?")) {
      return;
    }

    setSubmitting(true);

    try {
      await deleteArtist(adminToken, artistId);
      await loadDashboardContent(adminToken);
      if (editingArtistId === artistId) {
        setEditingArtistId("");
        setArtistForm(defaultArtistForm());
      }
      setStatusMessage("Artist deleted.");
    } catch (error) {
      setDashboardError(error.message || "Unable to delete artist.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteRelease(releaseId) {
    if (!window.confirm("Delete this release page?")) {
      return;
    }

    setSubmitting(true);

    try {
      await deleteRelease(adminToken, releaseId);
      await loadDashboardContent(adminToken);
      if (editingReleaseId === releaseId) {
        setEditingReleaseId("");
        setReleaseForm(defaultReleaseForm());
      }
      setStatusMessage("Release deleted.");
    } catch (error) {
      setDashboardError(error.message || "Unable to delete release.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEditArtist(artist) {
    setActiveAdminSection("artists");
    setEditingArtistId(artist.id);
    setArtistForm({
      name: artist.name || "",
      image: artist.image || "",
      role: artist.role || "",
      bio: artist.bio || "",
      location: artist.location || "",
      spotlight: artist.spotlight || "",
      featuredOnHome: Boolean(artist.featuredOnHome),
      socials: {
        instagram: artist.socials?.instagram || "",
        tiktok: artist.socials?.tiktok || "",
        youtube: artist.socials?.youtube || "",
      },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEditRelease(release) {
    setActiveAdminSection("releases");
    setEditingReleaseId(release.id);
    setReleaseForm({
      title: release.title || "",
      slug: release.slug || "",
      artistId: release.artistId || "",
      artistName: release.artistName || "",
      type: release.type || "",
      coverImage: release.coverImage || "",
      summary: release.summary || "",
      body: release.body || "",
      releaseDate: release.releaseDate || "",
      streamingUrl: release.streamingUrl || "",
      featuredOnHome: Boolean(release.featuredOnHome),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!adminToken) {
    return (
      <>
        <Seo
          title="Admin Login | Cityplug Records"
          description="Secure admin login for managing Cityplug artists, releases, and release pages."
        />
        <section className="page-header admin-page admin-auth-page">
        <div className="container admin-auth-shell">
          <div className="admin-auth-card">
            <div className="admin-auth-icon">
              <Lock size={28} />
            </div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">
              Sign in to manage artists, latest releases, and release detail pages.
            </p>
            <form className="contact-form" onSubmit={handleLogin}>
              <label>
                <span>Admin email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter admin email"
                  autoComplete="username"
                  required
                />
              </label>
              <label>
                <span>Admin password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  required
                />
              </label>
              {authError ? <p className="form-error">{authError}</p> : null}
              <button type="submit" className="button button-primary button-block" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo
        title="Admin Dashboard | Cityplug Records"
        description="Manage Cityplug artists, latest releases, and release detail pages from the admin dashboard."
      />
      <section className="page-header admin-page">
        <div className="container admin-header">
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">
              Manage the artists and latest releases shown on the home page, and create full pages for every release.
            </p>
          </div>
          <div className="admin-actions">
            <button type="button" className="button button-ghost admin-dark-button" onClick={() => navigate("/")}>
              View Site
            </button>
            <button type="button" className="button button-primary" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container admin-shell">
          <aside className="admin-sidebar">
            <div className="admin-sidebar-brand">
              <h2>Workspace</h2>
              <p>Manage your roster, release pages, and incoming messages.</p>
            </div>
            <div className="admin-sidebar-nav">
              <button
                type="button"
                className={`admin-sidebar-link${activeAdminSection === "artists" ? " is-active" : ""}`}
                onClick={() => setActiveAdminSection("artists")}
              >
                <Users size={18} />
                <span>Artists</span>
              </button>
              <button
                type="button"
                className={`admin-sidebar-link${activeAdminSection === "releases" ? " is-active" : ""}`}
                onClick={() => setActiveAdminSection("releases")}
              >
                <Disc3 size={18} />
                <span>Latest Releases</span>
              </button>
              <button
                type="button"
                className={`admin-sidebar-link${activeAdminSection === "messages" ? " is-active" : ""}`}
                onClick={() => {
                  setActiveAdminSection("messages");
                  void loadMessages(adminToken);
                }}
              >
                <MessageSquare size={18} />
                <span>Messages</span>
                <strong>{messages.length}</strong>
              </button>
            </div>
          </aside>

          <div className="admin-main">
            <div className="admin-feedback">
              {statusMessage ? <div className="success-card">{statusMessage}</div> : null}
              {dashboardError ? <p className="form-error">{dashboardError}</p> : null}
            </div>

            {activeAdminSection === "artists" ? (
              <div className="admin-stack">
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <h2>{editingArtistId ? "Edit Artist" : "Add Artist"}</h2>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => {
                        setEditingArtistId("");
                        setArtistForm(defaultArtistForm());
                      }}
                    >
                      <Plus size={16} />
                      New artist
                    </button>
                  </div>
                  <form className="contact-form" onSubmit={handleArtistSubmit}>
                    <ImageUploadField
                      label="Artist image"
                      value={artistForm.image}
                      onChange={(image) => setArtistForm((current) => ({ ...current, image }))}
                    />
                    <label>
                      <span>Artist name</span>
                      <input
                        type="text"
                        value={artistForm.name}
                        onChange={(event) => setArtistForm((current) => ({ ...current, name: event.target.value }))}
                        required
                      />
                    </label>
                    <label>
                      <span>Role</span>
                      <input
                        type="text"
                        value={artistForm.role}
                        onChange={(event) => setArtistForm((current) => ({ ...current, role: event.target.value }))}
                        required
                      />
                    </label>
                    <label>
                      <span>Bio</span>
                      <textarea
                        rows="5"
                        value={artistForm.bio}
                        onChange={(event) => setArtistForm((current) => ({ ...current, bio: event.target.value }))}
                        required
                      />
                    </label>
                    <label>
                      <span>Location</span>
                      <input
                        type="text"
                        value={artistForm.location}
                        onChange={(event) => setArtistForm((current) => ({ ...current, location: event.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Spotlight</span>
                      <input
                        type="text"
                        value={artistForm.spotlight}
                        onChange={(event) => setArtistForm((current) => ({ ...current, spotlight: event.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Instagram</span>
                      <input
                        type="url"
                        value={artistForm.socials.instagram}
                        onChange={(event) =>
                          setArtistForm((current) => ({
                            ...current,
                            socials: { ...current.socials, instagram: event.target.value },
                          }))
                        }
                      />
                    </label>
                    <label>
                      <span>TikTok</span>
                      <input
                        type="url"
                        value={artistForm.socials.tiktok}
                        onChange={(event) =>
                          setArtistForm((current) => ({
                            ...current,
                            socials: { ...current.socials, tiktok: event.target.value },
                          }))
                        }
                      />
                    </label>
                    <label>
                      <span>YouTube</span>
                      <input
                        type="url"
                        value={artistForm.socials.youtube}
                        onChange={(event) =>
                          setArtistForm((current) => ({
                            ...current,
                            socials: { ...current.socials, youtube: event.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="admin-checkbox">
                      <input
                        type="checkbox"
                        checked={artistForm.featuredOnHome}
                        onChange={(event) =>
                          setArtistForm((current) => ({
                            ...current,
                            featuredOnHome: event.target.checked,
                          }))
                        }
                      />
                      <span>Show this artist on the home page</span>
                    </label>
                    <button type="submit" className="button button-primary button-block" disabled={submitting}>
                      <Save size={18} />
                      {editingArtistId ? "Update Artist" : "Add Artist"}
                    </button>
                  </form>
                </div>

                <div className="admin-list-panel">
                  <div className="admin-panel-header">
                    <h2>Artists</h2>
                    <span className="pill">{content.artists.length}</span>
                  </div>
                  <div className="admin-list">
                    {content.artists.map((artist) => (
                      <article key={artist.id} className="admin-list-card">
                        <div className="admin-list-copy">
                          <strong>{artist.name}</strong>
                          <span>{artist.role}</span>
                        </div>
                        <div className="admin-card-actions">
                          <button type="button" className="icon-button" onClick={() => startEditArtist(artist)} aria-label={`Edit ${artist.name}`}>
                            <Pencil size={18} />
                          </button>
                          <button type="button" className="icon-button admin-delete-button" onClick={() => handleDeleteArtist(artist.id)} aria-label={`Delete ${artist.name}`}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {activeAdminSection === "releases" ? (
              <div className="admin-stack">
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <h2>{editingReleaseId ? "Edit Release" : "Add Release"}</h2>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => {
                        setEditingReleaseId("");
                        setReleaseForm(defaultReleaseForm());
                      }}
                    >
                      <Plus size={16} />
                      New release
                    </button>
                  </div>
                  <form className="contact-form" onSubmit={handleReleaseSubmit}>
                    <ImageUploadField
                      label="Release cover"
                      value={releaseForm.coverImage}
                      onChange={(coverImage) => setReleaseForm((current) => ({ ...current, coverImage }))}
                    />
                    <label>
                      <span>Release title</span>
                      <input
                        type="text"
                        value={releaseForm.title}
                        onChange={(event) => {
                          const title = event.target.value;
                          setReleaseForm((current) => ({
                            ...current,
                            title,
                            slug: current.slug || slugify(title),
                          }));
                        }}
                        required
                      />
                    </label>
                    <label>
                      <span>Page slug</span>
                      <input
                        type="text"
                        value={releaseForm.slug}
                        onChange={(event) => setReleaseForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
                        required
                      />
                    </label>
                    <label>
                      <span>Artist</span>
                      <select
                        value={releaseForm.artistId}
                        onChange={(event) => {
                          const artist = content.artists.find((item) => item.id === event.target.value);
                          setReleaseForm((current) => ({
                            ...current,
                            artistId: event.target.value,
                            artistName: artist?.name || current.artistName,
                          }));
                        }}
                      >
                        <option value="">Select an artist</option>
                        {content.artists.map((artist) => (
                          <option key={artist.id} value={artist.id}>
                            {artist.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Artist name override</span>
                      <input
                        type="text"
                        value={releaseForm.artistName}
                        onChange={(event) => setReleaseForm((current) => ({ ...current, artistName: event.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Release type</span>
                      <input
                        type="text"
                        value={releaseForm.type}
                        onChange={(event) => setReleaseForm((current) => ({ ...current, type: event.target.value }))}
                        placeholder="Single, EP, Album..."
                      />
                    </label>
                    <label>
                      <span>Release date</span>
                      <input
                        type="date"
                        value={releaseForm.releaseDate}
                        onChange={(event) => setReleaseForm((current) => ({ ...current, releaseDate: event.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Streaming link</span>
                      <input
                        type="url"
                        value={releaseForm.streamingUrl}
                        onChange={(event) => setReleaseForm((current) => ({ ...current, streamingUrl: event.target.value }))}
                      />
                    </label>
                    <label>
                      <span>Short summary</span>
                      <textarea
                        rows="3"
                        value={releaseForm.summary}
                        onChange={(event) => setReleaseForm((current) => ({ ...current, summary: event.target.value }))}
                        required
                      />
                    </label>
                    <label>
                      <span>Release page content</span>
                      <textarea
                        rows="7"
                        value={releaseForm.body}
                        onChange={(event) => setReleaseForm((current) => ({ ...current, body: event.target.value }))}
                        required
                      />
                    </label>
                    <label className="admin-checkbox">
                      <input
                        type="checkbox"
                        checked={releaseForm.featuredOnHome}
                        onChange={(event) =>
                          setReleaseForm((current) => ({
                            ...current,
                            featuredOnHome: event.target.checked,
                          }))
                        }
                      />
                      <span>Show this release in Latest Releases on the home page</span>
                    </label>
                    <button type="submit" className="button button-primary button-block" disabled={submitting}>
                      <Save size={18} />
                      {editingReleaseId ? "Update Release" : "Add Release"}
                    </button>
                  </form>
                </div>

                <div className="admin-list-panel">
                  <div className="admin-panel-header">
                    <h2>Latest Releases</h2>
                    <span className="pill">{content.releases.length}</span>
                  </div>
                  <div className="admin-list">
                    {content.releases.map((release) => (
                      <article key={release.id} className="admin-list-card">
                        <div className="admin-list-copy">
                          <strong>{release.title}</strong>
                          <span>{release.artistName || "No artist selected"}</span>
                          <NavLink to={`/releases/${release.slug}`} className="text-link">
                            View page <ArrowRight size={16} />
                          </NavLink>
                        </div>
                        <div className="admin-card-actions">
                          <button type="button" className="icon-button" onClick={() => startEditRelease(release)} aria-label={`Edit ${release.title}`}>
                            <Pencil size={18} />
                          </button>
                          <button type="button" className="icon-button admin-delete-button" onClick={() => handleDeleteRelease(release.id)} aria-label={`Delete ${release.title}`}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {activeAdminSection === "messages" ? (
              <div className="admin-list-panel">
                <div className="admin-panel-header">
                  <h2>Messages</h2>
                  <span className="pill">{messages.length}</span>
                </div>
                <div className="admin-list">
                  {messages.length ? (
                    messages.map((message) => (
                      <article key={message.id} className="admin-message-card">
                        <div className="admin-message-meta">
                          <strong>{message.name}</strong>
                          <a href={`mailto:${message.email}`} className="text-link">
                            {message.email}
                          </a>
                          <span>{message.createdAtLabel}</span>
                        </div>
                        <h3>{message.subject}</h3>
                        <p>{message.message}</p>
                      </article>
                    ))
                  ) : (
                    <div className="admin-empty-state">
                      <MessageSquare size={26} />
                      <p>No messages yet. New contact form submissions will show up here.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}

function ContactPage() {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setSent(false);
    setDeliveryMessage("");

    setSending(true);

    let savedToBackend = false;
    let sentToEmail = false;

    try {
      await createMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });
      savedToBackend = true;
    } catch (error) {
      console.error("Backend message save failed", error);
    }

    try {
      if (emailJsServiceId && emailJsTemplateId && emailJsPublicKey) {
        await emailjs.sendForm(emailJsServiceId, emailJsTemplateId, formRef.current, {
          publicKey: emailJsPublicKey,
        });
        sentToEmail = true;
      }
    } catch (error) {
      console.error("EmailJS send failed", error);
    }

    const emailConfigured = Boolean(emailJsServiceId && emailJsTemplateId && emailJsPublicKey);

    if (savedToBackend && (sentToEmail || !emailConfigured)) {
      localStorage.setItem(adminMessageSignalKey, String(Date.now()));
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSent(true);
      setDeliveryMessage(
        sentToEmail
          ? "Your message was delivered to the admin inbox and email."
          : "Your message was saved to the admin inbox. Email delivery is not configured yet."
      );
    } else if (savedToBackend) {
      localStorage.setItem(adminMessageSignalKey, String(Date.now()));
      setSubmitError(
        "Your message was saved to the admin inbox, but it was not delivered by email. Please check EmailJS settings."
      );
    } else if (sentToEmail) {
      setSubmitError(
        "Your message was sent by email, but it was not saved to the admin inbox. Please check the MongoDB connection."
      );
    } else {
      setSubmitError("We couldn't deliver your message to email or the admin inbox. Please try again.");
    }

    setSending(false);
  }

  return (
    <>
      <Seo
        title="Contact Cityplug Records"
        description="Contact Cityplug Records for artist inquiries, collaborations, bookings, and demo submissions."
      />
      <section className="page-header">
        <div className="container centered-copy">
          <h1 className="page-title">Get in Touch</h1>
          <p className="page-subtitle">
            Have a question? Want to collaborate? Let&apos;s talk.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container contact-grid">
          <div>
            <h2 className="contact-title">Contact Information</h2>
            <div className="contact-stack">
              <ContactItem
                icon={Mail}
                title="Email"
                primary={contactEmail}
                href={`mailto:${contactEmail}`}
                secondary="We'll respond within 24 hours"
              />
              <ContactItem
                icon={Phone}
                title="Phone"
                primary="+234 (123) 456-7890"
                href="tel:+2341234567890"
                secondary="Monday - Friday, 9am - 6pm WAT"
              />
              <ContactItem
                icon={MapPin}
                title="Location"
                primary="T16 Platinum Rows Estate"
                secondary="The heart of African music"
              />
            </div>
            <div className="social-block">
              <h3>Follow Us</h3>
              <div className="social-row">
                <SocialButton icon={InstagramIcon} label="Instagram" href={instagramUrl} />
                <SocialButton icon={TikTokIcon} label="TikTok" href={tiktokUrl} />
                <SocialButton icon={Mail} label="Email" href={`mailto:${contactEmail}`} />
              </div>
            </div>
          </div>
          <div>
            <h2 className="contact-title">Send us a Message</h2>
            {sent ? (
              <div className="success-card">
                <div className="success-title">Message Sent</div>
                <p>
                  {deliveryMessage || `Your message has been sent successfully. We'll get back to you soon at ${contactEmail}.`}
                </p>
              </div>
            ) : (
              <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
                <input type="hidden" name="to_email" value="igoldima@gmail.com" />
                <input type="hidden" name="user_name" value={formData.name} />
                <input type="hidden" name="user_email" value={formData.email} />
                <label>
                  <span>Your Name</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </label>
                <label>
                  <span>Email Address</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                  />
                </label>
                <label>
                  <span>Subject</span>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="artist-inquiry">Artist Inquiry</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="booking">Booking</option>
                    <option value="demo-submission">Demo Submission</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>
                  <span>Message</span>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Tell us about your project..."
                    required
                  />
                </label>
                {submitError ? <p className="form-error">{submitError}</p> : null}
                <button
                  type="submit"
                  className="button button-primary button-block"
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function ArtistCard({ artist, onSelect }) {
  return (
    <button
      type="button"
      className="artist-card"
      onClick={() => onSelect?.(artist)}
      aria-label={`Open profile for ${artist.name}`}
    >
      <div className="artist-image-wrap">
        <img src={artist.image} alt={artist.name} className="artist-image" loading="lazy" decoding="async" />
        <div className="artist-overlay">
          <span className="play-bubble" aria-hidden="true">
            <Play size={30} fill="currentColor" />
          </span>
        </div>
      </div>
      <p className="artist-role">{artist.role}</p>
      <h3>{artist.name}</h3>
    </button>
  );
}

function ReleaseCard({ release }) {
  return (
    <article className="release-card">
      <div className="release-cover">
        {release.coverImage ? (
          <img src={release.coverImage} alt={`${release.title} cover art`} className="release-cover-image" loading="lazy" decoding="async" />
        ) : (
          <Disc3 size={46} />
        )}
      </div>
      <h3>{release.title}</h3>
      <p className="accent-text">{release.artistName}</p>
      <p className="release-summary">{release.summary}</p>
      <div className="release-meta">
        <span className="pill">{release.type}</span>
        <NavLink to={`/releases/${release.slug}`} className="icon-button" aria-label={`Open ${release.title}`}>
          <ArrowRight size={20} />
        </NavLink>
      </div>
    </article>
  );
}

function ArtistModal({ artist, release, onClose }) {
  useEffect(() => {
    if (!artist) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [artist, onClose]);

  if (!artist) {
    return null;
  }

  const socialItems = [
    { label: "Instagram", href: artist.socials?.instagram, icon: InstagramIcon },
    { label: "TikTok", href: artist.socials?.tiktok, icon: TikTokIcon },
    { label: "YouTube", href: artist.socials?.youtube, icon: YouTubeIcon },
  ];

  return (
    <div className="artist-modal-backdrop" onClick={onClose} role="presentation">
      <section
        className="artist-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artist-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="artist-modal-close"
          onClick={onClose}
          aria-label="Close artist profile"
        >
          <X size={22} />
        </button>

        <div className="artist-modal-grid">
          <div className="artist-modal-media">
            <div className="artist-modal-portrait-wrap">
              <img
                src={artist.image}
                alt={artist.name}
                className="artist-modal-portrait"
                loading="lazy"
                decoding="async"
              />
            </div>

            {release ? (
              <div className="artist-player-card">
                <div className="artist-player-cover-wrap">
                  <img
                    src={release.coverImage || artist.image}
                    alt={`${release.title} cover art`}
                    className="artist-player-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="artist-player-type">{release.type}</span>
                </div>
                <div className="artist-player-content">
                  <p className="artist-player-kicker">Latest release</p>
                  <h3>{release.title}</h3>
                  <p className="artist-player-artist">{release.artistName}</p>
                  <p className="artist-player-note">{release.summary}</p>
                  <NavLink to={`/releases/${release.slug}`} className="text-link" onClick={onClose}>
                    Open release page <ArrowRight size={18} />
                  </NavLink>
                </div>
              </div>
            ) : null}
          </div>

          <div className="artist-modal-copy">
            <p className="artist-modal-kicker">Artist profile</p>
            <h2 id="artist-modal-title">{artist.name}</h2>
            <p className="artist-modal-role">{artist.role}</p>
            <p className="artist-modal-bio">{artist.bio}</p>

            <div className="artist-modal-meta">
              {artist.location ? <span className="artist-modal-chip">{artist.location}</span> : null}
              {artist.spotlight ? <span className="artist-modal-chip">{artist.spotlight}</span> : null}
            </div>

            <div className="artist-social-panel">
              <div className="artist-social-header">
                <h3>Connect with {artist.name}</h3>
                <p>Official social links managed from the admin dashboard.</p>
              </div>
              <div className="artist-social-grid">
                {socialItems.map(({ label, href, icon: Icon }) =>
                  href ? (
                    <a
                      key={label}
                      href={href}
                      className="artist-social-card"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="artist-social-icon">
                        <Icon size={20} />
                      </span>
                      <span className="artist-social-copy">
                        <strong>{label}</strong>
                        <small>Open official profile</small>
                      </span>
                      <ExternalLink size={18} />
                    </a>
                  ) : (
                    <div key={label} className="artist-social-card is-disabled" aria-disabled="true">
                      <span className="artist-social-icon">
                        <Icon size={20} />
                      </span>
                      <span className="artist-social-copy">
                        <strong>{label}</strong>
                        <small>Link coming soon</small>
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactItem({ icon: Icon, title, primary, href, secondary }) {
  return (
    <div className="contact-item">
      <div className="contact-icon">
        <Icon size={22} />
      </div>
      <div>
        <h3>{title}</h3>
        {href ? (
          <a href={href} className="contact-link">
            {primary}
          </a>
        ) : (
          <p>{primary}</p>
        )}
        <span>{secondary}</span>
      </div>
    </div>
  );
}

function SocialButton({ icon: Icon, label, href }) {
  return (
    <a
      href={href}
      className="social-button"
      aria-label={label}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
    >
      <Icon size={18} />
    </a>
  );
}

function SectionIntro({ title, text, accent = false }) {
  return (
    <Reveal className="container section-intro" variant="fade">
      <h2 className={`section-heading${accent ? " section-heading-accent" : ""}`}>
        {title}
      </h2>
      {text ? <p>{text}</p> : null}
    </Reveal>
  );
}

function PageHero({ title, subtitle, image }) {
  return (
    <section className="page-hero" style={{ backgroundImage: `url(${image})` }}>
      <div className="hero-overlay hero-overlay-light" />
      <Reveal className="container centered-copy page-hero-content" variant="slide-up">
        <h1 className="page-title page-title-light">{title}</h1>
        <p className="page-subtitle page-subtitle-light">{subtitle}</p>
      </Reveal>
    </section>
  );
}

function CtaBand({ title, text, buttonLabel, buttonTo }) {
  return (
    <section className="cta-band">
      <Reveal className="container centered-copy" variant="scale">
        <h2 className="section-heading section-heading-light">{title}</h2>
        <p className="cta-copy">{text}</p>
        <NavLink to={buttonTo} className="button button-light">
          {buttonLabel}
        </NavLink>
      </Reveal>
    </section>
  );
}

function ContentState({ loading, error, empty, emptyText, children }) {
  if (loading) {
    return (
      <div className="container centered-copy">
        <p className="page-subtitle">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container centered-copy">
        <p className="form-error">{error}</p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="container centered-copy">
        <p className="page-subtitle">{emptyText}</p>
      </div>
    );
  }

  return children;
}

function ImageUploadField({ label, value, onChange }) {
  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    onChange(dataUrl);
  }

  return (
    <div className="image-upload-field">
      <span>{label}</span>
      <div className="image-upload-row">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Or paste an image URL"
        />
      </div>
      {value ? (
        <div className="image-upload-preview">
          <img src={value} alt={`${label} preview`} />
        </div>
      ) : null}
    </div>
  );
}

function Seo({ title, description }) {
  useEffect(() => {
    document.title = title;

    const metaDescription = ensureMetaTag("description");
    metaDescription.setAttribute("content", description);

    const ogTitle = ensureMetaProperty("og:title");
    ogTitle.setAttribute("content", title);

    const ogDescription = ensureMetaProperty("og:description");
    ogDescription.setAttribute("content", description);
  }, [description, title]);

  return null;
}

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <img src={brandMark} alt="Cityplug logo" className="footer-brand-mark" />
              <h3>CITYPLUG</h3>
            </div>
            <p>Discovering and amplifying raw talent from Lagos to the world.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <FooterLinks
              links={[
                { to: "/", label: "Home" },
                { to: "/about", label: "About" },
                { to: "/talent", label: "Talent" },
                { to: "/contact", label: "Contact" },
              ]}
            />
          </div>
          <div>
            <h4>Services</h4>
            <FooterLinks
              links={[
                { to: "/services", label: "Artist Development" },
                { to: "/services", label: "Music Production" },
                { to: "/services", label: "Branding" },
                { to: "/services", label: "Booking" },
              ]}
            />
          </div>
          <div>
            <h4>Connect</h4>
            <div className="footer-socials">
              <SocialButton icon={InstagramIcon} label="Instagram" href={instagramUrl} />
              <SocialButton icon={TikTokIcon} label="TikTok" href={tiktokUrl} />
              <SocialButton icon={Mail} label="Email" href={`mailto:${contactEmail}`} />
            </div>
          </div>
        </div>
        <div className="footer-rule" />
        <div className="footer-bottom">
          <p>{year} Cityplug Records. All rights reserved.</p>
          <div className="footer-meta-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ links }) {
  return (
    <ul className="footer-list">
      {links.map((link, index) => (
        <li key={`${link.label}-${index}`}>
          <NavLink to={link.to}>{link.label}</NavLink>
        </li>
      ))}
    </ul>
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });
}

function ensureMetaTag(name) {
  let element = document.querySelector(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  return element;
}

function ensureMetaProperty(property) {
  let element = document.querySelector(`meta[property="${property}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  return element;
}

export default App;
