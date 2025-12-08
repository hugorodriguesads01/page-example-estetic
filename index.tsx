import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { 
  motion, 
  useInView, 
  HTMLMotionProps, 
  useScroll, 
  useTransform, 
  AnimatePresence
} from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  ChevronDown, ArrowRight, Star, Check, Instagram, 
  Facebook, Twitter, Zap, ShieldCheck, Sparkles, Activity,
  Calendar, UserCheck, Plus, Minus, MapPin, Phone, Mail,
  Menu, X
} from "lucide-react";

// --- Utilities ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Animation Components ---

// 1. Enhanced Reveal with Scale and Spring
interface RevealProps {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

const Reveal: React.FC<RevealProps> = ({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.8,
  yOffset = 50 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: yOffset, scale: 0.95 }}
      transition={{ 
        duration: duration, 
        delay: delay, 
        type: "spring", 
        stiffness: 70, 
        damping: 20 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 2. Parallax Image Component (Internal Movement)
interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

const ParallaxImage = ({ src, alt, className, priority = false }: ParallaxImageProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Image moves slightly opposite to scroll direction
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.15, 1.1]);

  return (
    <div ref={ref} className={cn("overflow-hidden w-full h-full relative", className)}>
      <motion.img 
        src={src} 
        alt={alt}
        style={{ y, scale }}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        className="w-full h-full object-cover absolute inset-0 will-change-transform"
      />
    </div>
  );
};

// --- BlurText Component (Refactored for proper wrapping & semantics) ---

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  as?: React.ElementType; 
  alwaysShow?: boolean;
}

const BlurText: React.FC<BlurTextProps> = ({ text, className = "", delay = 0, as: Component = "p", alwaysShow = false }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  
  // Split by words to allow natural wrapping
  const words = typeof text === 'string' ? text.split(" ") : [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: delay,
      },
    },
  };

  const letterAnimation = {
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
      y: 10
    },
    show: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  // Determine default display based on element type
  const isInline = Component === 'span' || Component === 'a';

  return (
    <Component 
      ref={ref} 
      className={cn(isInline ? "inline-block" : "block w-full text-balance", className)}
    >
      <motion.span
        variants={container}
        initial="hidden"
        animate={alwaysShow || isInView ? "show" : "hidden"}
        className="inline"
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.25em] last:mr-0 align-top">
            {word.split("").map((char, charIndex) => (
              <motion.span
                key={`${wordIndex}-${charIndex}`}
                variants={letterAnimation}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.span>
    </Component>
  );
};

// --- ShinyButton Component ---

const animationProps = {
  initial: { "--x": "100%", scale: 1 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  whileHover: { scale: 1.05 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
} as any;

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties & { [key: string]: any };
}

const ShinyButton = ({ children, className, ...props }: ShinyButtonProps) => {
  return (
    <motion.button
      {...animationProps}
      {...props}
      className={cn(
        "relative rounded-lg px-6 py-2 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out hover:shadow",
        "bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/10%)_0%,transparent_60%)] hover:shadow-[0_0_20px_hsl(var(--primary)/10%)]",
        className
      )}
    >
      <span
        className="relative block size-full text-sm uppercase tracking-wide font-light text-inherit"
        style={{
          maskImage:
            "linear-gradient(-75deg,hsl(var(--primary)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--primary)) calc(var(--x) + 100%))",
        }}
      >
        {children}
      </span>
      <span
        style={{
          mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          maskComposite: "exclude",
        }}
        className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,hsl(var(--primary)/10%)_calc(var(--x)+20%),hsl(var(--primary)/50%)_calc(var(--x)+25%),hsl(var(--primary)/10%)_calc(var(--x)+100%))] p-px"
      ></span>
    </motion.button>
  );
};

// --- Sections ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${
          isScrolled 
            ? "bg-transparent backdrop-blur-xl py-4 text-kanva-dark border-white/20 shadow-sm" 
            : "bg-transparent py-4 md:py-6 text-white border-white/10"
        }`}
        role="navigation"
        aria-label="Menu principal"
      >
        <div className="max-w-[1600px] mx-auto flex justify-between items-center px-4 md:px-8">
          {/* Mobile Menu Button */}
          <div className="md:hidden z-50">
             <button onClick={toggleMenu} className="p-2" aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}>
                {isMobileMenuOpen ? <X size={24} className="text-kanva-dark" /> : <Menu size={24} className={isScrolled ? "text-kanva-dark" : "text-white"} />}
             </button>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-xs md:text-sm tracking-widest uppercase font-medium">
            <a href="#benefits" className="hover:opacity-60 transition-opacity">
              <BlurText text="Benefícios" as="span" alwaysShow />
            </a>
            <a href="#method" className="hover:opacity-60 transition-opacity">
               <BlurText text="Método" as="span" delay={0.1} alwaysShow />
            </a>
            <a href="#results" className="hover:opacity-60 transition-opacity">
               <BlurText text="Resultados" as="span" delay={0.2} alwaysShow />
            </a>
            <a href="#faq" className="hover:opacity-60 transition-opacity">
               <BlurText text="Dúvidas" as="span" delay={0.3} alwaysShow />
            </a>
          </div>
          
          {/* Logo Center */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <a href="#hero" className="hover:opacity-90 transition-opacity" aria-label="Voltar ao início">
              <img 
                src="https://i.imgur.com/pnqGlqC.png" 
                alt="Estética Premium Logo" 
                width="150"
                height="48"
                className={cn("h-8 md:h-12 w-auto object-contain transition-all duration-500", !isScrolled && "brightness-0 invert")}
              />
            </a>
          </div>

          <div className="flex items-center space-x-6">
            <a href="#agendar" className="hidden md:block">
              <ShinyButton 
                className={isScrolled ? "text-kanva-dark bg-kanva-dark/5" : "text-white"}
                style={isScrolled ? { "--primary": "0 0% 10%" } : undefined}
              >
                Agendar Avaliação
              </ShinyButton>
            </a>
            {/* Mobile simplified button */}
             <a href="#agendar" className="md:hidden">
              <ShinyButton 
                className={cn("px-4 py-1 text-xs", isScrolled ? "text-kanva-dark bg-kanva-dark/5" : "text-white")}
                style={isScrolled ? { "--primary": "0 0% 10%" } : undefined}
              >
                Agendar
              </ShinyButton>
            </a>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#F9F9F7] text-kanva-dark pt-24 px-8 flex flex-col items-center space-y-8 md:hidden"
          >
            <a href="#benefits" onClick={toggleMenu} className="text-xl tracking-widest uppercase font-serif">Benefícios</a>
            <a href="#method" onClick={toggleMenu} className="text-xl tracking-widest uppercase font-serif">Método</a>
            <a href="#results" onClick={toggleMenu} className="text-xl tracking-widest uppercase font-serif">Resultados</a>
            <a href="#faq" onClick={toggleMenu} className="text-xl tracking-widest uppercase font-serif">Dúvidas</a>
            <div className="pt-8">
              <img src="https://i.imgur.com/pnqGlqC.png" alt="Logo" className="h-8 opacity-50" width="100" height="32" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Hero = () => {
  return (
    <header id="hero" className="relative h-screen w-full">
      {/* Fixed Background and Content for Overlap Effect */}
      <div className="fixed inset-0 w-full h-full z-0">
         {/* Optimized Background using img tag instead of div background-image for LCP */}
        <img 
            src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop"
            alt="Modelo com pele saudável e radiante"
            className="absolute inset-0 w-full h-full object-cover"
            // @ts-ignore - fetchPriority is standard but React types lag behind
            fetchPriority="high"
            decoding="sync"
        />
        <div className="absolute inset-0 bg-black/30 z-10"></div>

        {/* Text Content */}
        <div className="relative z-20 flex flex-col justify-center h-full max-w-[1600px] mx-auto px-6 md:px-8 w-full">
          <div className="max-w-4xl text-white pt-20">
            <div className="text-4xl sm:text-5xl md:text-8xl font-serif leading-tight mb-6 md:mb-8 drop-shadow-lg text-balance">
               <BlurText text="Recupere sua" as="h1" />
               <BlurText text="melhor versão" as="span" className="italic font-light block mt-2 md:mt-0" delay={0.3} />
            </div>
            
            <div className="text-base md:text-2xl text-white/90 max-w-2xl font-light mb-8 md:mb-10 leading-relaxed drop-shadow-md text-pretty">
              <BlurText 
                text="Pele renovada, corpo modelado e autoestima elevada, sem procedimentos invasivos. Sinta-se mais bonita, confiante e valorizada." 
                delay={0.8}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
            >
              <a href="#agendar" className="inline-block border-b border-white pb-2 text-xs md:text-sm uppercase tracking-[0.2em] hover:text-white/70 hover:border-white/70 transition-all">
                Agende sua Avaliação
              </a>
            </motion.div>
          </div>
        </div>

        {/* Footer info - fixed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 md:bottom-10 left-0 w-full px-6 md:px-8 text-white z-20"
        >
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
             <div className="hidden md:block w-1/3 text-xs tracking-widest opacity-60">
               <BlurText text="SÃO PAULO — BRASIL" delay={1.8} />
             </div> 
             <div className="flex space-x-3 self-center md:self-auto">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 rounded-full bg-white" 
                />
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
             </div>
             <a href="#benefits" className="w-full md:w-1/3 text-center md:text-right flex justify-center md:justify-end items-center space-x-2 text-xs tracking-widest uppercase cursor-pointer hover:opacity-70 transition-opacity">
                <BlurText text="Descubra mais" as="span" delay={2} />
                <ArrowRight className="w-4 h-4 rotate-90" />
             </a>
          </div>
        </motion.div>
      </div>
    </header>
  );
};

const DiagonalShowcase = () => {
  return (
    // Increased z-index to 30 to overlap fixed hero content on scroll
    // Changed bg-black to bg-white
    <section className="relative w-full md:h-[80vh] min-h-[auto] md:min-h-[600px] overflow-hidden bg-white z-30">
      {/* Mobile: Flex Col (Stacked), Desktop: Skewed Row */}
      <div className="flex flex-col md:flex-row w-full md:w-[120%] h-auto md:h-full md:-ml-[10%]">
        
        {/* 1 */}
        {/* Updated Height to 400px for consistency on mobile, added animation */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative w-full md:flex-1 overflow-hidden md:-skew-x-12 group border-b md:border-b-0 md:border-r border-white/10 h-[400px] md:h-auto"
        >
          <div className="absolute inset-0 md:[transform:skewX(12deg)]"> 
            <img 
              src="https://i.imgur.com/PwiCZX9.png" 
              className="w-full h-full object-cover scale-110 md:scale-[1.3] transition-transform duration-700 group-hover:scale-[1.4] origin-center"
              alt="Tratamento Facial e Harmonia" 
              loading="lazy"
              decoding="async"
            />
          </div>
          {/* Overlay content */}
          <div className="absolute inset-0 md:[transform:skewX(12deg)] flex flex-col justify-end pb-12 md:pb-24 items-start text-left bg-transparent pointer-events-none">
             {/* Adjusted padding/width for responsive layout */}
             <div className="w-full max-w-full md:max-w-md pl-6 pr-6 md:pl-[28%] md:pr-4"> 
                 <BlurText text="HARMONIA FACIAL" as="h3" className="text-white font-serif text-3xl md:text-4xl mb-4 tracking-wider drop-shadow-md text-balance" />
                 <BlurText text="Realce sua beleza natural com procedimentos personalizados para você." as="p" className="text-white/90 font-light text-base md:text-base leading-relaxed drop-shadow-md text-pretty" delay={0.2} />
             </div>
          </div>
        </motion.div>

        {/* 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative w-full md:flex-1 overflow-hidden md:-skew-x-12 group border-b md:border-b-0 md:border-r border-white/10 h-[400px] md:h-auto"
        >
          <div className="absolute inset-0 md:[transform:skewX(12deg)]"> 
            <img 
              src="https://i.imgur.com/FaH2vGL.png" 
              className="w-full h-full object-cover scale-110 md:scale-[1.3] transition-transform duration-700 group-hover:scale-[1.4] origin-center"
              alt="Ambiente Relaxante e Acolhedor" 
              loading="lazy"
              decoding="async"
            />
          </div>
        </motion.div>
        
        {/* 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative w-full md:flex-1 overflow-hidden md:-skew-x-12 group h-[400px] md:h-auto"
        >
          <div className="absolute inset-0 md:[transform:skewX(12deg)]"> 
            <img 
              src="https://i.imgur.com/8AhGilz.png" 
              className="w-full h-full object-cover scale-110 md:scale-[1.3] transition-transform duration-700 group-hover:scale-[1.4] origin-center"
              alt="Resultado Natural do Tratamento" 
              loading="lazy"
              decoding="async"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const FeaturesBar = () => {
  const features = [
    { icon: Zap, title: "Tecnologia Avançada", desc: "Equipamentos de ponta que potencializam seus resultados desde a primeira sessão." },
    { icon: ShieldCheck, title: "Conforto e Segurança", desc: "Redução de medidas e rejuvenescimento sem cirurgias ou procedimentos invasivos." },
    { icon: Sparkles, title: "Tratamento Completo", desc: "Protocolo integrado facial e corporal para uma transformação harmônica." }
  ];

  return (
    <section id="benefits" className="relative z-10 py-20 md:py-32 bg-[#F9F9F7]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {features.map((item, idx) => (
          <Reveal key={idx} delay={idx * 0.2}>
            <motion.div 
              whileHover={{ y: -15, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
              className="bg-white p-8 md:p-12 rounded-2xl shadow-[0_2px_40px_-10px_rgba(0,0,0,0.05)] transition-all duration-500 text-center group h-full border border-transparent hover:border-gray-100"
            >
              <div className="flex justify-center mb-6 md:mb-8 text-kanva-olive group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                <item.icon strokeWidth={1} size={40} />
              </div>
              <BlurText text={item.title} as="h3" className="text-xl md:text-2xl font-serif font-medium mb-4 text-kanva-dark" delay={0.1} />
              <BlurText text={item.desc} as="p" className="text-gray-500 leading-relaxed font-light text-sm md:text-base text-pretty" delay={0.2} />
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

const ProblemSolution = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="relative z-10 w-full bg-white py-20 md:py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        
        {/* Animated Clip Path Reveal */}
        <motion.div 
          ref={ref}
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={isInView ? { clipPath: "inset(0% 0 0 0)" } : { clipPath: "inset(100% 0 0 0)" }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[400px] md:h-[700px] w-full rounded-2xl overflow-hidden shadow-2xl order-2 md:order-1 group"
        >
            <div className="absolute inset-0">
               <ParallaxImage 
                 src="https://i.imgur.com/dBtaVbd.png" 
                 alt="Mulher refletindo no espelho com confiança" 
               />
            </div>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
        </motion.div>
        
        <div className="space-y-8 md:space-y-10 order-1 md:order-2">
          <div className="text-3xl md:text-6xl font-serif text-kanva-dark leading-[1.1] text-balance">
            <BlurText text="Você sente que sua aparência não acompanha" as="h2" />
            <BlurText text="quem você é?" as="span" className="italic text-kanva-olive block mt-2 text-3xl md:text-6xl font-serif" delay={0.5} />
          </div>
          <div className="space-y-6 md:space-y-8 text-gray-600 leading-relaxed text-base md:text-lg font-light">
            <div>
              <BlurText text="Parece cansada, apagada e frustrada por não ver resultado nos cuidados que tenta manter." as="p" className="text-pretty" />
              <div className="mt-4">
                 <BlurText text="Internamente, pensa: “Eu sei que posso ficar melhor… só não encontro um lugar realmente confiável que entregue resultado.”" as="span" className="italic text-kanva-dark font-medium block text-pretty" delay={0.3} />
              </div>
            </div>
            <BlurText text="E ainda surgem as dúvidas: será que vai funcionar? Será que dói? Será que vale o investimento?" as="p" className="text-pretty" delay={0.4} />
            
            <Reveal delay={0.6}>
              <motion.div 
                whileHover={{ x: 10 }}
                className="pt-6 md:pt-8 border-l-2 border-kanva-olive pl-6 md:pl-8 bg-[#F9F9F7] rounded-r-xl p-6 md:p-8 cursor-default"
              >
                  <h3 className="font-serif text-xl md:text-2xl text-kanva-dark mb-3 flex items-center">
                    <Check className="w-5 h-5 md:w-6 md:h-6 mr-3 text-kanva-olive shrink-0"/> 
                    <BlurText text="A Solução" as="span" />
                  </h3>
                  <BlurText text="Um protocolo totalmente personalizado, construído com tecnologia estética avançada e acompanhamento profissional — para entregar resultado rápido, seguro e visível." as="p" className="text-pretty" />
              </motion.div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

const Methodology = () => {
  const steps = [
    { 
      title: "Avaliação Completa", 
      desc: "Análise detalhada do seu perfil para criar um plano individual.",
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600" 
    },
    { 
      title: "Tecnologia Combinada", 
      desc: "Uso estratégico de laser, radiofrequência e bioestímulo.",
      img: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=600" 
    },
    { 
      title: "Acompanhamento", 
      desc: "Suporte contínuo e sessões periódicas para garantir evolução.",
      img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600" 
    },
  ];

  return (
    <section id="method" className="relative z-10 bg-[#F9F9F7] py-20 md:py-32">
      <div className="max-w-4xl mx-auto text-center px-6 mb-12 md:mb-20">
        <div className="text-3xl md:text-6xl font-serif leading-tight text-kanva-dark mb-6 md:mb-8 text-balance">
          <BlurText text="Como funciona o" as="h2" />
          <BlurText text="Método" as="span" className="italic text-kanva-olive block text-3xl md:text-6xl font-serif" delay={0.2} />
        </div>
        <div className="max-w-xl mx-auto text-base md:text-lg font-light text-gray-600 text-pretty">
          <BlurText text="Tudo pensado para acelerar seu resultado com o mínimo de intervenção possível através de uma combinação estratégica." as="p" delay={0.4} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {steps.map((item, idx) => (
          <Reveal key={idx} delay={idx * 0.2}>
            <motion.div 
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
            >
              <div className="relative bg-[#F2F2EF] rounded-2xl overflow-hidden aspect-[4/5] mb-8 shadow-sm">
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase z-10 shadow-sm text-kanva-dark">
                  Passo 0{idx + 1}
                </div>
                {/* Parallax Image inside Card */}
                <ParallaxImage src={item.img} alt={item.title} />
              </div>
              <div className="text-center px-4">
                <BlurText text={item.title} as="h3" className="font-serif text-2xl md:text-3xl text-kanva-dark mb-3" />
                <BlurText text={item.desc} as="p" className="text-gray-500 leading-relaxed font-light text-pretty" delay={0.2} />
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

const Authority = () => {
  return (
    <section className="relative z-10 bg-white py-20 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-8">
            <div className="max-w-3xl text-3xl md:text-6xl font-serif text-kanva-dark leading-tight mb-4 text-balance">
                <BlurText text="Criado para mulheres que valorizam" as="h2" />
                <BlurText text="estética premium" as="span" className="italic text-kanva-olive md:mx-2 block md:inline text-3xl md:text-6xl font-serif" delay={0.3} />
                <BlurText text="e resultados reais." as="span" className="text-3xl md:text-6xl font-serif" delay={0.6} />
            </div>
            <div className="flex flex-col items-start md:items-end pb-2">
               <motion.div 
                 whileHover={{ scale: 1.05 }}
                 className="bg-[#F9F9F7] px-6 py-3 rounded-full border border-gray-100"
               >
                  <BlurText text="Ambiente sofisticado e seguro" as="span" className="text-kanva-dark font-serif italic text-base md:text-lg" />
               </motion.div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-auto md:h-[650px]">
          {/* Large Left Card */}
          <Reveal className="h-[500px] md:h-full">
            <motion.div 
              whileHover={{ scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-[2rem] overflow-hidden group h-full bg-kanva-green shadow-xl"
            >
              <div className="absolute inset-0 opacity-60 mix-blend-overlay">
                 <ParallaxImage 
                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop" 
                    alt="Ambiente da Clínica" 
                 />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-white max-w-md pr-4">
                  <BlurText text="Excelência Técnica" as="h3" className="text-3xl md:text-4xl font-serif mb-6" />
                  <ul className="space-y-4">
                      {['Avaliação profissional', 'Equipamentos avançados', 'Evolução monitorada'].map((item, i) => (
                          <motion.li 
                            key={i} 
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            className="flex items-center space-x-3 text-base md:text-lg opacity-90"
                          >
                              <div className="bg-white/20 p-1 rounded-full"><Check className="w-3 h-3" /></div>
                              <span className="font-light">{item}</span>
                          </motion.li>
                      ))}
                  </ul>
              </div>
            </motion.div>
          </Reveal>

          {/* Right Column */}
          <div className="flex flex-col gap-8 h-auto md:h-full">
            {/* Top Right */}
            <Reveal delay={0.2} className="flex-1 min-h-[350px]">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-[#EBEBE6] rounded-[2rem] p-8 md:p-12 flex-1 flex flex-col justify-center relative overflow-hidden group h-full transition-colors hover:bg-[#e6e6e0]"
              >
                 <div className="relative z-10">
                   <Activity className="w-10 h-10 md:w-12 md:h-12 mb-6 md:mb-8 text-kanva-olive" strokeWidth={1} />
                   <BlurText text="Alta Tecnologia" as="h3" className="text-3xl md:text-4xl font-serif mb-4" />
                   <BlurText text="Combinação de protocolos para máxima eficácia em menos tempo." as="p" className="text-gray-600 max-w-xs font-light leading-relaxed text-pretty" delay={0.2} />
                 </div>
                 <motion.img 
                    initial={{ scale: 1, opacity: 0.1 }}
                    whileHover={{ scale: 1.1, opacity: 0.15 }}
                    transition={{ duration: 1 }}
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop" 
                    alt="Tecnologia Estética" 
                    loading="lazy"
                    decoding="async"
                    className="absolute bottom-0 right-0 w-2/3 h-full object-cover mix-blend-multiply transition-all"
                 />
              </motion.div>
            </Reveal>

            {/* Bottom Right */}
            <Reveal delay={0.3} className="flex-1 min-h-[350px]">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-kanva-olive text-white rounded-[2rem] p-8 md:p-12 flex-1 relative overflow-hidden flex items-center h-full shadow-lg"
              >
                 <div className="relative z-10 w-full md:w-2/3">
                   <BlurText text="Personalização" as="h3" className="text-3xl md:text-4xl font-serif mb-2" />
                   <BlurText text="Profunda & Individual" as="p" className="text-xl md:text-2xl font-light italic opacity-80 mb-8" delay={0.3} />
                   <div className="text-sm opacity-90 border-l border-white/30 pl-6 leading-relaxed">
                      <BlurText text="Cada corpo é único. Seu tratamento também deve ser." as="span" delay={0.5} />
                   </div>
                 </div>
                 <img 
                    src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop" 
                    className="absolute right-0 top-0 w-1/2 h-full object-cover opacity-20 mix-blend-soft-light"
                    alt="Textura de pele"
                    loading="lazy"
                    decoding="async"
                 />
              </motion.div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

const Offer = () => {
    return (
      <section id="offer" className="relative z-10 w-full bg-kanva-green text-white py-20 md:py-32 px-6 overflow-hidden">
        {/* Background Image Parallax */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-10 mix-blend-overlay">
             <ParallaxImage 
               src="https://images.unsplash.com/photo-1615396899839-a9927db42272?q=80&w=1972&auto=format&fit=crop" 
               alt="Textura de Fundo"
             />
        </div>
        
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-20">
            <BlurText text="Oferta Exclusiva" as="span" className="text-xs md:text-sm tracking-[0.3em] uppercase text-white/60 mb-4 block" />
            <div className="text-3xl md:text-7xl font-serif mb-6 leading-none text-balance">
              <BlurText text="Protocolo Premium" as="h2" />
              <br className="hidden md:block" />
              <BlurText text="de Transformação Estética" as="span" className="italic text-white/70 block md:inline mt-2 md:mt-0 text-3xl md:text-7xl font-serif" delay={0.3} />
            </div>
          </div>
          
          <Reveal delay={0.2}>
            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 bg-white/5 rounded-[2rem] p-8 md:p-16 border border-white/10 backdrop-blur-md shadow-2xl"
            >
              <div>
                  <h3 className="text-2xl md:text-3xl font-serif mb-8 flex items-center">
                      <Sparkles className="w-6 h-6 mr-4 text-[#D4AF37]" /> 
                      <BlurText text="O que está incluído:" as="span" />
                  </h3>
                  <ul className="space-y-4 md:space-y-6 text-white/90">
                      {[
                          "Avaliação personalizada detalhada",
                          "Sessões combinadas de alta tecnologia",
                          "Plano individual de evolução",
                          "Acompanhamento profissional",
                          "Direcionamento pós-sessão"
                      ].map((item, i) => (
                          <motion.li 
                            key={i} 
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start"
                          >
                              <div className="mt-1 bg-white/20 rounded-full p-1 mr-4 shrink-0"><Check size={12} /></div>
                              <span className="text-lg md:text-xl font-light leading-snug">{item}</span>
                          </motion.li>
                      ))}
                  </ul>
                  
                  <div className="mt-8 md:mt-12 pt-8 md:pt-10 border-t border-white/10">
                      <BlurText text="Bônus Exclusivos:" as="h4" className="text-xl font-serif mb-6 text-[#D4AF37]" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                          <motion.div whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }} className="bg-white/5 p-6 rounded-xl border border-white/5 transition-colors cursor-default">
                              <span className="block text-xs uppercase opacity-50 mb-2 tracking-widest">Oferta</span>
                              <BlurText text="Sessão Relaxante Extra" as="span" className="font-medium" />
                          </motion.div>
                          <motion.div whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }} className="bg-white/5 p-6 rounded-xl border border-white/5 transition-colors cursor-default">
                              <span className="block text-xs uppercase opacity-50 mb-2 tracking-widest">Material</span>
                              <BlurText text="Guia de Cuidados" as="span" className="font-medium" />
                          </motion.div>
                      </div>
                  </div>
              </div>

              <div className="flex flex-col justify-between">
                  <div className="space-y-8">
                      <BlurText text="Vantagens Reais" as="h3" className="text-2xl md:text-3xl font-serif mb-4 md:mb-8" />
                      {[
                        { t: "Mais resultado em menos sessões", d: "Tecnologia otimizada para seu tempo." },
                        { t: "Zero invasão, Segurança total", d: "Sem tempo de recuperação (downtime)." },
                        { t: "Efeito rejuvenescido e modelado", d: "Resultados naturais que valorizam você." }
                      ].map((item, i) => (
                        <div key={i} className="group">
                           <h4 className="font-medium text-lg md:text-xl mb-1 group-hover:text-[#D4AF37] transition-colors">
                              <BlurText text={item.t} as="span" />
                           </h4>
                           <BlurText text={item.d} as="p" className="text-sm md:text-base text-white/50 font-light text-pretty" delay={0.2} />
                        </div>
                      ))}
                  </div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="mt-12 bg-kanva-olive/40 p-6 md:p-8 rounded-2xl border border-white/10"
                  >
                      <p className="text-xs text-center mb-6 uppercase tracking-[0.2em] opacity-80">Planos Disponíveis</p>
                      <div className="flex flex-col md:flex-row justify-between text-center font-serif text-lg md:text-xl gap-4 md:gap-0">
                          <span className="flex-1 border-b md:border-b-0 md:border-r border-white/20 pb-2 md:pb-0 md:py-2">
                             <BlurText text="4 Semanas" as="span" />
                          </span>
                          <span className="flex-1 border-b md:border-b-0 md:border-r border-white/20 pb-2 md:pb-0 md:py-2">
                             <BlurText text="8 Semanas" as="span" delay={0.1} />
                          </span>
                          <span className="flex-1 py-2 italic text-[#D4AF37]">
                             <BlurText text="Intensivo" as="span" delay={0.2} />
                          </span>
                      </div>
                  </motion.div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>
    );
};

const SocialProof = () => {
    return (
      <section id="results" className="relative z-10 bg-[#F9F9F7] pb-20 md:pb-32 pt-20 md:pt-32 px-6 text-center overflow-hidden">
         <Reveal>
           <motion.div 
             className="flex justify-center -space-x-6 mb-12"
             initial={{ rotate: 0 }}
             whileInView={{ rotate: [0, -2, 2, 0] }}
             transition={{ duration: 2, ease: "easeInOut" }}
           >
              <div className="bg-white p-2 shadow-lg rotate-[-6deg] z-0 w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border border-gray-100">
                 <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-full h-full object-cover" alt="Cliente 1" loading="lazy" />
              </div>
              <div className="bg-white p-2 shadow-xl rotate-[6deg] z-10 w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border border-gray-100">
                 <img src="https://randomuser.me/api/portraits/women/68.jpg" className="w-full h-full object-cover" alt="Cliente 2" loading="lazy" />
              </div>
              <div className="bg-white p-2 shadow-lg rotate-[-3deg] z-0 w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border border-gray-100">
                 <img src="https://randomuser.me/api/portraits/women/32.jpg" className="w-full h-full object-cover" alt="Cliente 3" loading="lazy" />
              </div>
           </motion.div>
    
           <div className="text-2xl md:text-5xl font-serif max-w-5xl mx-auto leading-tight text-kanva-dark mb-12 md:mb-16 text-balance">
             <BlurText text="“Nunca me senti tão bem comigo mesma. O protocolo mudou não só meu corpo, mas minha confiança.”" as="h3" />
           </div>
         </Reveal>
  
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
            {[
              "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=400",
              "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=400",
              "https://images.unsplash.com/photo-1519699047748-de8e457b634e?auto=format&fit=crop&q=80&w=400",
              "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=400"
            ].map((src, i) => (
               <Reveal key={i} delay={i * 0.1}>
                 <motion.div 
                   whileHover={{ y: -10, scale: 1.05 }}
                   className="aspect-[3/4] rounded-xl overflow-hidden relative group shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer"
                 >
                    <img src={src} className="w-full h-full object-cover transition-transform duration-700" alt={`Resultado Cliente ${i+1}`} loading="lazy" />
                    <div className="absolute inset-0 bg-black/20 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/95 backdrop-blur px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg shadow-sm">Cliente {i+1}</div>
                    </div>
                 </motion.div>
               </Reveal>
            ))}
         </div>
      </section>
    )
}

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    
    const questions = [
        { q: "Vai funcionar para mim?", a: "Sim — o protocolo é totalmente personalizado para as necessidades do seu corpo e pele, garantindo eficácia para diferentes perfis." },
        { q: "Dói?", a: "A maioria dos procedimentos é confortável e não invasiva. Priorizamos tecnologias que entregam resultado sem sofrimento." },
        { q: "Quantas sessões preciso?", a: "Definimos após a avaliação inicial detalhada, mas nossos planos variam geralmente entre 4 a 8 semanas." },
        { q: "Como são os resultados?", a: "Melhora visível em pele e medidas, com evolução semanal acompanhada pela nossa equipe." },
        { q: "E se eu não gostar?", a: "Ajustamos o protocolo até atingir o resultado esperado. Sua satisfação e autoestima são nossa prioridade." },
        { q: "O protocolo é completo?", a: "Sim — inclui avaliação, tecnologia avançada, acompanhamento profissional e plano personalizado." }
    ];

    return (
        <section id="faq" className="relative z-10 bg-white py-20 md:py-32 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-12 md:mb-20 text-center">
                    <BlurText text="Dúvidas Frequentes" as="h2" className="text-3xl md:text-5xl font-serif text-kanva-dark" />
                </div>
                <div className="space-y-4">
                    {questions.map((item, idx) => (
                        <Reveal key={idx} delay={idx * 0.05}>
                            <motion.div 
                              className="border-b border-gray-100 pb-6"
                              initial={false}
                            >
                                <button 
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    className="w-full flex justify-between items-start md:items-center text-left py-4 hover:text-kanva-olive transition-colors group gap-4"
                                    aria-expanded={openIndex === idx}
                                >
                                    <span className="font-serif text-lg md:text-2xl text-kanva-dark group-hover:text-kanva-olive transition-colors text-balance">
                                        {item.q}
                                    </span>
                                    <div className={`p-2 shrink-0 rounded-full transition-colors ${openIndex === idx ? 'bg-kanva-olive text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {openIndex === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    </div>
                                </button>
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: openIndex === idx ? "auto" : 0, opacity: openIndex === idx ? 1 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <p className="text-gray-500 leading-relaxed pr-0 md:pr-12 text-base md:text-lg font-light pt-2 text-pretty">{item.a}</p>
                                </motion.div>
                            </motion.div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}

const CTA = () => {
  return (
    <section id="agendar" className="relative z-10 px-6 py-20 md:py-32 bg-[#F9F9F7]">
      <Reveal>
        <motion.div 
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto bg-kanva-dark rounded-[2rem] md:rounded-[3rem] p-10 md:p-32 relative overflow-hidden flex flex-col items-center text-center shadow-2xl"
        >
           <div className="relative z-10 max-w-4xl text-white">
              <div className="text-3xl md:text-7xl font-serif mb-8 leading-tight text-balance">
                  <BlurText text="Transforme sua aparência com" as="h2" />
                  <br className="hidden md:block"/>
                  <BlurText text="segurança e tecnologia" as="span" className="italic text-white/50 block md:inline mt-2 text-3xl md:text-7xl font-serif" delay={0.3} />
              </div>
              <div className="text-white/70 mb-12 text-lg md:text-xl leading-relaxed font-light max-w-2xl mx-auto text-pretty">
                <BlurText text="E conquiste a versão que você deseja ver no espelho." as="p" />
                <BlurText text="Resultados reais, visíveis e rápidos: pele renovada, corpo modelado e autoestima elevada." as="p" delay={0.5} />
              </div>
              
              <ShinyButton 
                className="bg-white text-kanva-dark border-none hover:bg-gray-100 px-8 md:px-10 py-3 md:py-4 text-sm md:text-base w-full md:w-auto"
                style={{ "--primary": "0 0% 0%" } as React.CSSProperties}
              >
                 Agende sua avaliação agora
              </ShinyButton>
           </div>

           <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 pointer-events-none opacity-20 mix-blend-screen">
               <ParallaxImage 
                 src="https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=600"
                 alt="Textura Visual"
                 className="opacity-50"
               />
           </div>
        </motion.div>
      </Reveal>
    </section>
  )
}

const Footer = () => {
  return (
    <footer id="contact" className="relative z-10 bg-kanva-dark text-white pt-20 md:pt-24 pb-12 px-6 md:px-8 text-sm overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12 md:gap-16 mb-16 md:mb-24 border-b border-white/10 pb-16">
        <div className="lg:col-span-2">
           <img 
              src="https://i.imgur.com/pnqGlqC.png" 
              alt="Estética Premium Logo" 
              width="150"
              height="48"
              className="h-8 md:h-12 w-auto object-contain invert brightness-0 mb-8" 
           />
           <BlurText text="Criado para mulheres que valorizam estética premium e resultados reais. Ambiente sofisticado e seguro para sua transformação." as="p" className="text-gray-400 leading-relaxed max-w-sm mb-10 text-base font-light text-pretty" delay={0.2} />
           <div className="flex space-x-6 text-gray-400">
             <motion.div whileHover={{ scale: 1.2, color: "white" }}><Instagram className="w-6 h-6 cursor-pointer" aria-label="Instagram" /></motion.div>
             <motion.div whileHover={{ scale: 1.2, color: "white" }}><Facebook className="w-6 h-6 cursor-pointer" aria-label="Facebook" /></motion.div>
             <motion.div whileHover={{ scale: 1.2, color: "white" }}><Twitter className="w-6 h-6 cursor-pointer" aria-label="Twitter" /></motion.div>
           </div>
        </div>

        <Reveal delay={0.2}>
          <BlurText text="Tratamentos" as="h4" className="font-serif text-xl mb-6 md:mb-8" />
          <ul className="space-y-4 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Facial</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Corporal</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Protocolos Híbridos</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Tecnologias</a></li>
          </ul>
        </Reveal>

        <Reveal delay={0.3}>
          <BlurText text="Institucional" as="h4" className="font-serif text-xl mb-6 md:mb-8" />
          <ul className="space-y-4 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Equipe</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Unidades</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
          </ul>
        </Reveal>

        <Reveal delay={0.4}>
           <BlurText text="Contato" as="h4" className="font-serif text-xl mb-6 md:mb-8" />
           <ul className="space-y-4 text-gray-400">
             <li><a href="#" className="hover:text-white transition-colors">WhatsApp</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Agendamento</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Localização</a></li>
           </ul>
        </Reveal>
      </div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs tracking-wide">
         <p>&copy; 2024 Estética Premium. Todos os direitos reservados.</p>
         <div className="flex items-center space-x-8 mt-6 md:mt-0">
            <span className="cursor-pointer hover:text-white transition-colors">Privacidade</span>
            <span className="cursor-pointer hover:text-white transition-colors">Termos</span>
         </div>
      </div>
    </footer>
  );
};

const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/5511999999999"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] p-4 rounded-full shadow-lg text-white flex items-center justify-center hover:shadow-2xl transition-shadow"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Fale conosco no WhatsApp"
    >
       <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
       </svg>
    </motion.a>
  )
}

// --- Main App Component ---

const App = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F7] text-kanva-dark font-sans selection:bg-kanva-green selection:text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <DiagonalShowcase />
      <FeaturesBar />
      <ProblemSolution />
      <Methodology />
      <Authority />
      <CTA />
      <Offer />
      <SocialProof />
      <FAQ />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);