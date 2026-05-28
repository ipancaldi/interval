/**
 * services-catalog.ts
 *
 * Single source of truth for the five Interval services. Both
 * /services/ (index of cards) and /services/<slug>/ (detail pages)
 * read from this file.
 *
 * Editing here updates both. The structure mirrors the ServiceModule
 * component's props.
 */

export interface ServiceListBlock {
  label: string;
  items: string[];
}

export interface Service {
  slug: string;
  num: string;
  name: string;
  /** One-line summary used on the index card */
  shortIntro: string;
  /** Long-form intro paragraphs on the detail page */
  intro: string[];
  whatsIncluded?: ServiceListBlock;
  designedFor?: ServiceListBlock;
  outcomes?: ServiceListBlock;
  /** Optional "Approach" paragraphs at the foot of the detail page */
  approach?: string[];
}

export interface ServicePalette {
  bg: string;
  pattern: string;
  text: string;
}

/**
 * One colour combo per service. Shared between the Services index
 * (the cards) and the detail page (hero bg + pattern). Keeping them
 * in sync here means the card and the page it leads to always wear
 * the same identity.
 */
export const paletteBySlug: Record<string, ServicePalette> = {
  safari:      { bg: "#C8B4DC", pattern: "#C05000", text: "#000000" }, // mauve  · brick
  vision:      { bg: "#C05000", pattern: "#82FFC0", text: "#F9F9F3" }, // brick  · mint
  masterplan:  { bg: "#3D2EB8", pattern: "#F9F9F3", text: "#F9F9F3" }, // electric · off-white
  prototyping: { bg: "#F2EDD8", pattern: "#3D2EB8", text: "#000000" }, // beige  · electric
  realisation: { bg: "#82FFC0", pattern: "#3D2EB8", text: "#000000" }, // mint   · electric
};

export const getPalette = (slug: string): ServicePalette =>
  paletteBySlug[slug] ?? paletteBySlug.safari!;

export const services: Service[] = [
  {
    slug: "safari",
    num: "01",
    name: "Interval Experience Safari",
    shortIntro:
      "A curated virtual and/or in-person immersion programme designed to inspire breakthrough thinking through direct exposure to world-class experiences.",
    intro: [
      "A curated virtual and/or in-person immersion programme designed to inspire breakthrough thinking through direct exposure to world-class experiences across industries, sectors and cities.",
      "Interval's Experience Safari takes participants behind the scenes of exceptional physical and digital environments — from highly technical operations to deeply sensory, emotionally engaging experiences — to observe, interrogate and understand how leading organisations design and deliver total experiences in practice.",
      "Each safari combines curated visits, expert conversations, operational access and facilitated reflection using Interval's Total Experience Design framework. Participants explore both comparable and unexpected environments to uncover transferable insights, challenge assumptions and identify new opportunities for innovation.",
    ],
    whatsIncluded: {
      label: "Key activities",
      items: [
        "Curated virtual and/or physical experience tours",
        "Behind-the-scenes access to leading organisations and venues",
        "Conversations with designers, operators and experience leaders",
        "Cross-sector inspiration spanning technical, cultural, retail, hospitality, entertainment, sport and immersive environments",
        "Facilitated workshops and reflection sessions",
        "Application of Interval's Total Experience Design lens across every experience",
      ],
    },
    designedFor: {
      label: "Designed for",
      items: [
        "Core project leadership teams, executive stakeholders and transformation leaders seeking to:",
        "Expand strategic thinking",
        "Accelerate innovation and ideation",
        "Build alignment and shared reference points",
        "Strengthen collaboration across disciplines",
        "Experience the “art of the possible” first hand",
      ],
    },
    outcomes: {
      label: "Outcomes",
      items: [
        "New ideas and provocations grounded in real-world execution",
        "A broader understanding of how leading experiences are designed and operated",
        "Stronger team alignment and collective inspiration",
        "Transferable lessons and benchmarks to inform future experience strategy and delivery",
        "A shared language and framework for evaluating total experiences holistically",
      ],
    },
  },

  {
    slug: "vision",
    num: "02",
    name: "Interval Experience Vision",
    shortIntro:
      "A strategic visioning and experience design phase that defines the future-state ambition for a destination, venue or ecosystem.",
    intro: [
      "A strategic visioning and experience design phase that defines the future-state ambition for a destination, venue or ecosystem through the lens of total experience design.",
      "Building on the insights gathered through the Experience Safari, this phase translates inspiration into a clear and differentiated experience vision — combining strategic foresight, human insight and creative possibility to define what the experience could and should become.",
      "Interval works with leadership teams to explore the “art of the possible” across physical, digital and immersive environments — shaping bold yet actionable concepts that respond to evolving audience expectations and future behaviours.",
    ],
    whatsIncluded: {
      label: "What's included",
      items: [
        "Experience vision and strategic positioning development",
        "“Art of the possible” exploration across global benchmarks and emerging trends",
        "Visitor segmentation and audience prioritisation",
        "Persona development grounded in behavioural and emotional insight",
        "End-to-end customer journey mapping",
        "Experience principles and design guardrails",
        "Opportunity identification across physical, digital, operational and sensory dimensions",
        "Concept ideation workshops and collaborative co-creation sessions",
      ],
    },
    outcomes: {
      label: "Outcomes",
      items: [
        "A compelling future-state experience vision",
        "Clearly defined visitor segments and personas",
        "Strategic experience principles to guide future development",
        "A shared leadership alignment around the ambition and direction",
        "Inspiration translated into practical opportunity areas",
        "A foundation for concept design, operational planning and future investment decisions",
      ],
    },
    approach: [
      "Interval applies its Total Experience Design framework to ensure the vision is developed holistically — balancing human, operational, technological, commercial and emotional considerations equally.",
      "The process moves beyond traditional demographic profiling to develop a deeper understanding of visitor motivations, behaviours, expectations and emotional needs. This creates richer personas and more meaningful experience strategies that can guide future design and operational decisions.",
    ],
  },

  {
    slug: "masterplan",
    num: "03",
    name: "Interval Experience Masterplan",
    shortIntro:
      "A comprehensive strategic blueprint that translates the experience vision into an integrated, actionable roadmap for delivery.",
    intro: [
      "A comprehensive strategic blueprint that translates the experience vision into an integrated, actionable roadmap for delivery across every touchpoint of the customer journey.",
      "The Experience Masterplan brings together the physical, digital, operational, sensory and human dimensions of an experience into one connected ecosystem — ensuring that every element works cohesively to deliver a distinctive and commercially sustainable total experience.",
      "Where the Experience Vision defines the ambition, the Masterplan defines how it comes to life.",
    ],
    whatsIncluded: {
      label: "What's included",
      items: [
        "End-to-end experience architecture and masterplanning",
        "Customer and stakeholder journey ecosystems",
        "Spatial and precinct experience planning",
        "Digital and physical touchpoint integration",
        "Operational and service experience design",
        "Sensory and emotional experience mapping",
        "Experience zoning and activation strategies",
        "Experience sequencing across pre, during and post-visit phases",
        "Prioritised opportunity and investment roadmap",
        "Governance and delivery framework recommendations",
        "Future capability and technology considerations",
        "Partner selection advice and recommendations",
      ],
    },
    outcomes: {
      label: "Outcomes",
      items: [
        "A clear and integrated experience blueprint",
        "Alignment across leadership, operations and design teams",
        "Defined priorities, phasing and opportunity areas",
        "A practical roadmap from vision to execution",
        "Greater consistency across all experience touchpoints",
        "A future-focused framework that supports innovation and evolution over time",
      ],
    },
    approach: [
      "Interval applies its Total Experience Design framework to ensure no dimension is designed in isolation. The Experience Masterplan considers how environments, technology, service, storytelling, operations, culture and human behaviours interact to shape perception and memory over time.",
      "The process balances visionary thinking with operational reality — aligning creative ambition with commercial viability, organisational capability and long-term scalability.",
      "Drawing on cross-sector inspiration and global best practice, Interval develops experience ecosystems that are cohesive, adaptable and designed to evolve alongside changing visitor expectations.",
    ],
  },

  {
    slug: "prototyping",
    num: "04",
    name: "Interval Experience Prototyping",
    shortIntro:
      "A rapid experimentation and testing phase designed to bring experience concepts to life before full-scale implementation.",
    intro: [
      "A rapid experimentation and testing phase designed to bring experience concepts to life before full-scale implementation.",
      "Experience Prototyping allows organisations to test, refine and validate ideas in real-world or simulated environments — reducing risk, strengthening decision-making and ensuring experiences resonate emotionally, operationally and commercially before significant investment is made.",
      "Rather than relying solely on presentations, concepts or static designs, Interval creates tangible prototypes that allow stakeholders and users to actively experience, interrogate and shape future-state ideas.",
    ],
    whatsIncluded: {
      label: "What's included",
      items: [
        "Rapid concept and experience prototyping",
        "Physical, digital and hybrid experience simulations",
        "Visitor and stakeholder testing sessions",
        "Sensory, spatial and service interaction testing",
        "Scenario-based journey walkthroughs",
        "Pilot activations and live environment trials",
        "Experience scripting and choreography",
        "Frontline and operational team testing",
        "Feedback capture and insight analysis",
        "Iterative refinement and optimisation",
      ],
    },
    outcomes: {
      label: "Outcomes",
      items: [
        "Validated experience concepts informed by real-world testing",
        "Greater confidence in strategic and design decisions",
        "Early identification of operational or experiential gaps",
        "Stronger stakeholder alignment and buy-in",
        "Refined experiences grounded in audience behaviour and emotional response",
        "Reduced implementation risk and costly late-stage changes",
      ],
    },
    approach: [
      "Interval applies its Total Experience Design framework throughout the prototyping process to test experiences holistically — not just aesthetically or functionally, but emotionally, operationally and behaviourally.",
      "Prototypes may range from low-fidelity journey simulations and service role-play exercises through to immersive spatial mock-ups, digital interactions or live pilot activations. The objective is to uncover friction points, validate assumptions and identify opportunities for enhancement early in the process.",
      "The process encourages experimentation, collaboration and iteration — creating a safe environment to challenge ideas, explore alternatives and evolve concepts based on real feedback and observed behaviours.",
    ],
  },

  {
    slug: "realisation",
    num: "05",
    name: "Interval Realisation Framework",
    shortIntro:
      "A delivery and activation framework designed to translate the experience masterplan into tangible, operationally successful real-world experiences.",
    intro: [
      "A delivery and activation framework designed to translate the experience masterplan into tangible, operationally successful and emotionally engaging real-world experiences.",
      "The Realisation Framework ensures that ambitious experience visions are not diluted during execution. It provides the structure, governance and decision-making approach required to align strategy, design, operations, technology and delivery partners around a single integrated experience outcome.",
      "Rather than treating delivery as a purely operational process, Interval approaches implementation through the lens of total experience design — ensuring that every decision continues to support the intended emotional, functional and commercial experience objectives.",
    ],
    whatsIncluded: {
      label: "What's included",
      items: [
        "Experience delivery and implementation framework",
        "Governance and decision-making structures",
        "Experience principles and quality assurance tools",
        "Design and operational alignment workshops",
        "Experience standards and consistency frameworks",
        "Cross-functional delivery integration",
        "Prototype, testing and pilot programme design",
        "Operational readiness and service activation planning",
        "Customer and frontline staff experience alignment",
        "Measurement, feedback and optimisation framework",
        "Risk identification and mitigation across experience delivery",
      ],
    },
    outcomes: {
      label: "Outcomes",
      items: [
        "A structured framework for delivering complex experiences",
        "Greater alignment across teams, suppliers and partners",
        "Clear governance and accountability mechanisms",
        "Increased confidence that the intended experience vision will be realised",
        "Reduced execution risk and operational fragmentation",
        "A foundation for continuous improvement and future evolution",
      ],
    },
    approach: [
      "Interval works alongside leadership, operators, designers and delivery teams to ensure the original experience ambition remains intact throughout implementation.",
      "Using the Total Experience Design framework as a reference point, the Realisation Framework continuously tests whether decisions across physical environments, service, technology, operations and communications are contributing to the intended overall experience.",
      "The process emphasises collaboration, iteration and real-world testing — helping organisations identify gaps, friction points and missed opportunities before launch.",
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
