import { useEffect, useRef, useState } from "react";
import emailjs, { EmailJSResponseStatus } from "@emailjs/browser";
import {
  ArrowRight,
  Disc3,
  Mail,
  MapPin,
  Menu,
  Mic2,
  Music2,
  Phone,
  Play,
  Radio,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";

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

const heroImage =
  "/assets/hero-main.webp";
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

const featuredArtists = [
  {
    name: "DJ Op Dot",
    image: "/assets/Djopdot.jpg",
  },
  {
    name: "Pearl",
    image: "/assets/Pearl.jpg",
  },
  {
    name: "Tekunbi",
    image: "/assets/Tekunbi.jpg",
  },
];

const allArtists = [
  ...featuredArtists,
  {
    name: "Sheay",
    image: "/assets/Sheay.jpg",
  },
  {
    name: "Wandey",
    image: "/assets/Wandey.jpg",
  },
  {
    name: "Bella",
    image: "/assets/Bella.jpg",
  },
];

const releases = [
  { title: "Midnight Echoes", artist: "Zara Beats", type: "Single" },
  { title: "Street Poetry", artist: "King Cipher", type: "Album" },
  { title: "Soul Awakening", artist: "Luna Essence", type: "EP" },
];

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

function App() {
  return (
    <div className="site-shell">
      <ScrollToTop />
      <Navbar />
      <main className="main-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/talent" element={<TalentPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      <Footer />
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

function HomePage() {
  return (
    <>
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
        <div className="container artist-grid">
          {featuredArtists.map((artist, index) => (
            <Reveal key={artist.name} variant="slide-up" delay={index * 90}>
              <ArtistCard artist={artist} />
            </Reveal>
          ))}
        </div>
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
        <div className="container release-grid">
          {releases.map((release, index) => (
            <Reveal key={release.title} variant="scale" delay={index * 100}>
              <article className="release-card">
                <div className="release-cover">
                  <Disc3 size={46} />
                </div>
                <h3>{release.title}</h3>
                <p className="accent-text">{release.artist}</p>
                <div className="release-meta">
                  <span className="pill">{release.type}</span>
                  <button type="button" className="icon-button" aria-label="Play release">
                    <Play size={20} fill="currentColor" />
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
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
            <img src={whoWeAreImage} alt="Cityplug collective" />
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
      <PageHero
        title=""
        subtitle=""
        image={aboutImage}
      />
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
              <article className="value-card">
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
          <h2 className="section-heading">Ready to Join the Movement?</h2>
          <p className="body-copy">
            Whether you&apos;re an artist, producer, or collaborator, we want to hear
            from you.
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

function TalentPage() {
  return (
    <>
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
        <div className="container artist-grid artist-grid-large">
          {allArtists.map((artist) => (
            <ArtistCard key={artist.name} artist={artist} />
          ))}
        </div>
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

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setSent(false);

    if (!emailJsServiceId || !emailJsTemplateId || !emailJsPublicKey) {
      setSubmitError(
        "Email delivery is not configured yet. Add the EmailJS service, template, and public key to your Vite environment."
      );
      return;
    }

    setSending(true);

    try {
      await emailjs.sendForm(emailJsServiceId, emailJsTemplateId, formRef.current, {
        publicKey: emailJsPublicKey,
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSent(true);
    } catch (error) {
      console.error("EmailJS send failed", error);

      if (error instanceof EmailJSResponseStatus) {
        setSubmitError(
          `We couldn't send your message right now. EmailJS returned ${error.status}: ${error.text}`
        );
      } else {
        setSubmitError("We couldn't send your message right now. Please try again.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <>
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
                  Your message has been sent successfully. We&apos;ll get back to you
                  soon at {contactEmail}.
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

function ArtistCard({ artist }) {
  return (
    <article className="artist-card">
      <div className="artist-image-wrap">
        <img src={artist.image} alt={artist.name} className="artist-image" />
        <div className="artist-overlay">
          <button type="button" className="play-bubble" aria-label={`Listen to ${artist.name}`}>
            <Play size={30} fill="currentColor" />
          </button>
        </div>
      </div>
      <h3>{artist.name}</h3>
    </article>
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

export default App;
