import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { defaultApplicationFields } from "../lib/careers/form-fields";
import { plainTextToHtml } from "../lib/rich-text";

const RESUME_TEMPLATE_URL =
  "https://docs.google.com/document/d/1jVVfv_g-_DoUfLOKL1ol66UhkIXb42Cp8sBsYCbF4wA/edit";
const STANDARD_FORM_ID = "tpl-standard-job";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@safeafrika.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    console.log("SEED_ADMIN_PASSWORD not set — skipping admin user seed.");
    return;
  }
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "SAFE Africa Admin",
      passwordHash: await hash(password, 12),
      role: "SUPER_ADMIN",
    },
  });
  console.log(`Admin user ready: ${email}`);
}

const thematicAreas = [
  {
    slug: "agriculture-food-nutrition-systems",
    title: "Agriculture, Food and Nutrition Systems",
    tagline: "Advancing resilient, market-responsive, and nutrition-sensitive food systems.",
    description:
      "SAFE Africa strengthens agriculture, food, and nutrition systems through research, analysis, and advisory support that improve production, processing, distribution, and market performance. We work with farmers, agribusinesses, market actors, and policymakers to identify constraints, expand access to nutritious foods, and build resilient value chains. Our work in this area also incorporates digital agriculture solutions that improve decision-making across the food system.",
    impact:
      "SAFE Africa strengthens agriculture, food, and nutrition systems by generating evidence that improves productivity, market performance, dietary diversity, and access to nutritious foods. Our work supports resilient agri-food systems, strengthens value chains, and promotes practical innovations—including digital agriculture solutions—that help farmers, agribusinesses, and institutions make better decisions.",
    icon: "sprout",
    coverImage: "/images/afns.jpeg",
    order: 1,
  },
  {
    slug: "girls-womens-empowerment",
    title: "Girls' and Women's Empowerment",
    tagline: "Promoting agency, inclusion, and equitable participation in development.",
    description:
      "SAFE Africa advances girls' and women's empowerment by generating evidence that informs inclusive policies, programs, and investments. We conduct gender analysis, assess barriers to participation and access, and support interventions that strengthen economic opportunities, decision-making power, and social inclusion. This work ensures that development initiatives are more equitable and responsive.",
    impact:
      "SAFE Africa advances girls' and women's empowerment by producing evidence that informs inclusive policies, programs, and investments. Our work helps reduce barriers to participation, expand economic opportunities, and strengthen the agency, voice, and decision-making power of women and girls in development processes and livelihood systems.",
    icon: "users",
    coverImage: "/images/gwe.jpeg",
    order: 2,
  },
  {
    slug: "youth-skills-workforce-development",
    title: "Youth Skills and Workforce Development",
    tagline: "Strengthening employability, entrepreneurship, and skills for inclusive growth.",
    description:
      "SAFE Africa supports youth skills and workforce development through research, program design, and advisory services that promote employability, entrepreneurship, and productive engagement in the economy. We assess labor market opportunities, barriers to youth participation, and pathways for skills development in agriculture and other sectors. Our work helps partners design interventions that equip young people for productive livelihoods.",
    impact:
      "SAFE Africa contributes to youth skills and workforce development by generating evidence that helps partners design effective education, training, and enterprise support initiatives. Our work identifies opportunities for employability, entrepreneurship, and skills development, equipping young people to participate more productively in agriculture and the broader economy.",
    icon: "graduation-cap",
    coverImage: "/images/yswd.jpeg",
    order: 3,
  },
  {
    slug: "climate-change-nrm",
    title: "Climate Change Adaptation and Natural Resource Management",
    tagline: "Building resilience while promoting sustainable stewardship of land, water, and ecosystems.",
    description:
      "SAFE Africa supports climate change adaptation and natural resource management through evidence-based analysis, advisory services, and applied research that strengthens resilience and sustainability. Our work includes climate-smart agriculture, sustainable land and water management, ecosystem stewardship, and natural resource assessments that inform planning, investment, and policy decisions.",
    impact:
      "SAFE Africa strengthens resilience to climate and environmental risks by promoting climate-smart agriculture, sustainable land and water management, and responsible natural resource stewardship. Our evidence and advisory work helps partners assess environmental risks, undertake natural resource and project assessments, adopt adaptive practices, and protect ecosystems while sustaining productivity.",
    icon: "leaf",
    coverImage: "/images/canrm.jpeg",
    order: 4,
  },
  {
    slug: "wash",
    title: "Water, Sanitation and Hygiene (WASH)",
    tagline: "Innovative WASH solutions that empower communities and strengthen systems.",
    description:
      "At SAFE Africa, we deliver innovative Water, Sanitation, and Hygiene (WASH) solutions that empower communities and strengthen systems. Partnering with governments, NGOs, and private sector organizations, we design and implement projects that improve health, resilience, and sustainability. Our expertise spans WASH and Disaster Risk Reduction (DRR) advisory, monitoring and evaluation, and facility assessments.",
    impact:
      "SAFE Africa supports WASH programs through research, monitoring, evaluation, and evidence generation that improve health, resilience, and sustainability for communities and institutions.",
    icon: "droplets",
    coverImage: "/images/wsh.jpeg",
    order: 5,
  },
  {
    slug: "social-protection",
    title: "Social Protection",
    tagline: "Generating evidence to strengthen resilience, inclusion, and support for vulnerable populations.",
    description:
      "SAFE Africa contributes to stronger social protection systems through research, assessments, and advisory services that improve the design, targeting, and effectiveness of programs for vulnerable populations. We examine livelihoods, shocks, coping strategies, and access to services to generate evidence that informs responsive and inclusive interventions.",
    impact:
      "SAFE Africa supports stronger social protection systems by generating evidence that improves program design, targeting, responsiveness, and inclusion for vulnerable populations. Our work helps governments and development partners better understand livelihoods, shocks, coping strategies, and service access so they can strengthen resilience, reduce vulnerability, and improve well-being.",
    icon: "shield",
    coverImage: "/images/sp.jpeg",
    order: 6,
  },
];

const services = [
  ["baseline-endline-surveys", "Baseline & Endline Surveys", "Designing and implementing comprehensive surveys to establish benchmarks and measure project outcomes.", "clipboard-list"],
  ["impact-assessments-evaluations", "Impact Assessments & Evaluations", "Conducting rigorous evaluations to determine effectiveness, sustainability, and scalability of interventions.", "bar-chart-3"],
  ["randomized-experimental-studies", "Randomized Experimental Studies", "Applying advanced research methods to generate credible, data-driven insights for policy and practice.", "flask-conical"],
  ["feasibility-studies", "Feasibility Studies", "Assessing project viability, risks, and opportunities to support informed investment and implementation decisions.", "search-check", "/images/service-feasibility-demo-farm.jpeg"],
  ["agri-enterprise-financial-advisory", "Agri-enterprise Financial Analysis & Advisory", "Financial and economic analysis, business advisory, and investment support for agribusinesses, producer organizations, and agricultural enterprises — enterprise diagnostics, cost-benefit analysis, profitability assessment, financial modeling, and strategic advice.", "banknote", "/images/service-financial-advisory-training.jpeg"],
  ["food-nutritional-security-analysis", "Food & Nutritional Security Analysis", "Expert insights into food systems, dietary diversity, and nutrition outcomes for vulnerable populations.", "wheat"],
  ["livelihood-analysis", "Livelihood Analysis", "Evaluating household and community-level livelihoods to strengthen resilience and economic inclusion.", "home"],
  ["wash", "Water, Sanitation & Hygiene (WASH)", "Supporting WASH programs through research, monitoring, evaluation, and evidence generation.", "droplets", "/images/service-wash-borehole-drilling.jpeg"],
  ["gender-social-inclusion", "Gender & Social Inclusion", "Mainstreaming equity by integrating gender and social justice into agricultural and development programs.", "heart-handshake"],
  ["climate-smart-agriculture-nrm", "Climate-Smart Agriculture & NRM", "Promoting sustainable practices that enhance resilience, conserve ecosystems, and adapt to climate change.", "cloud-sun"],
  ["data-management-analytics", "Data Management & Analytics", "Applying strong analytical methods and digital tools to deliver accurate, timely, and actionable insights.", "database"],
  ["multi-cultural-regional-expertise", "Multi-Cultural & Regional Expertise", "Delivering consultancy assignments across Kenya and African countries with sensitivity to diverse contexts.", "globe"],
].map(([slug, title, description, icon, image], i) => ({ slug, title, description, icon, image, order: i + 1 }));

const projects = [
  {
    slug: "kjade-baseline-evaluation",
    title: "Kenya Jobs, Agriculture and Digital Ecosystem (KJADE) Baseline Evaluation",
    client: "World Bank and IFPRI",
    location: "Makueni, Meru, Nakuru, and Narok Counties, Kenya",
    periodStart: new Date("2025-09-01"),
    periodEnd: new Date("2026-02-01"),
    overview:
      "SAFE Africa supported a World Bank-led study examining how digital technologies can improve farmer outcomes and create better jobs in Kenya's agricultural sector.",
    role:
      "We coordinated and implemented a large-scale household survey, including obtaining necessary approvals, mapping and listing farmers, recruitment and training of field teams, piloting of tools, field logistics, CAPI-enabled data collection, quality assurance, data cleaning, and reporting. We also secured required approvals and configured the SurveyCTO server and monitoring systems.",
    scaleResults:
      "SAFE Africa administered household surveys to 3,800 households across 380 villages in four counties, delivering high-quality baseline data to inform policy and program design.",
    areas: ["agriculture-food-nutrition-systems", "youth-skills-workforce-development"],
    coverImage: "/images/project-kjade-baseline-cover.jpeg",
  },
  {
    slug: "kjade-mapping-listing",
    title: "Mapping and Listing of Households and Communities for the KJADE Survey",
    client: "World Bank and IFPRI",
    location: "Makueni, Meru, Nakuru, and Narok Counties, Kenya",
    periodStart: new Date("2024-09-01"),
    periodEnd: new Date("2025-01-01"),
    overview:
      "As part of the KJADE study, IFPRI required a robust household mapping and listing and sampling frame for the planned baseline survey.",
    role:
      "SAFE Africa planned and managed the listing exercise, recruited and trained enumerators, designed and scripted the listing tool in CAPI, secured national and local authorizations, coordinated fieldwork, and cleaned and delivered the final datasets in usable formats.",
    scaleResults:
      "SAFE Africa listed households in 380 villages across the four study counties, providing a reliable sampling frame for the subsequent baseline evaluation.",
    areas: ["agriculture-food-nutrition-systems"],
    coverImage: "/images/project-kjade-mapping-team-briefing.jpeg",
  },
  {
    slug: "machakos-resilience-feasibility-study",
    title: "Feasibility Study for Improved Resilience for Rural Populations in the Semi-Arid Lands of Machakos County",
    client: "Habitat for Humanity Kenya",
    location: "Machakos County, Kenya",
    periodStart: new Date("2024-09-01"),
    periodEnd: new Date("2025-01-01"),
    overview:
      "This assignment assessed the feasibility of a rural resilience initiative focused on access to safe water, sanitation, hygiene, livelihoods, and social structures in Machakos County.",
    role:
      "SAFE Africa conducted a mixed-methods feasibility study examining the social, economic, technical, legal, and operational relevance of the proposed project, while also assessing institutional capacity and alignment with BMZ requirements and OECD DAC criteria.",
    scaleResults:
      "The study generated evidence to inform project design, implementation planning, and investment decisions for a resilience-focused program in semi-arid rural communities.",
    areas: ["wash", "climate-change-nrm"],
    coverImage: "/images/project-machakos-resilience-cover.jpeg",
  },
  {
    slug: "restore-africa-baseline-evaluation",
    title: "Restore Africa (RESAF) Programme Climate Asset Management Baseline Evaluation",
    client: "World Agroforestry Centre (CIFOR-ICRAF)",
    location: "Kilifi, Kwale, Elgeyo Marakwet, Narok, and Migori Counties, Kenya",
    periodStart: new Date("2023-09-01"),
    periodEnd: new Date("2024-03-01"),
    overview:
      "This baseline evaluation supported the Restore Africa programme, which aims to restore landscapes and livelihoods in East and Southern Africa through climate asset management and long-term resilience building.",
    role:
      "SAFE Africa led the mapping and listing of stakeholders in various counties, provided expert opinion to World Vision and ICRAF on sampling design and study protocol design. We led tool development, recruitment and training of field teams, fieldwork coordination, data management, analysis, and reporting of key findings.",
    scaleResults:
      "SAFE Africa conducted baseline evaluation activities with 1,700 households, generating evidence to support implementation of large-scale landscape restoration and livelihoods programs.",
    areas: ["climate-change-nrm"],
    coverImage: "/images/project-restore-africa-solar-water-tank.jpeg",
  },
  {
    slug: "seed-systems-injustices-study",
    title: "Study on Injustices Faced by Marginalized Groups in Access to Seed Systems",
    client: "The Syngenta Group",
    location: "Nakuru, Nyandarua, and Isiolo Counties, Kenya",
    periodStart: new Date("2024-07-01"),
    periodEnd: new Date("2024-10-01"),
    overview:
      "This study examined barriers faced by marginalized groups—including women, youth, and persons with disabilities—in accessing seed systems within the Central Highlands Ecoregion Foodscape program.",
    role:
      "SAFE Africa worked with implementing partners to map key actors in the seed system, including agro-dealers, processors, aggregators, and farmers. We applied mixed methods for data collection, evidence synthesis, and evaluation across the three counties, and conducted analysis to identify value chain dynamics, key challenges, and opportunities on both the supply and demand sides.",
    scaleResults:
      "The assignment produced actionable evidence on inclusion and equity in seed systems, helping to inform more responsive and inclusive agricultural programming.",
    areas: ["agriculture-food-nutrition-systems", "girls-womens-empowerment", "social-protection"],
    coverImage: "/images/project-seed-systems-community-meeting.jpeg",
  },
];

const projectImages: { projectSlug: string; url: string; caption: string; order: number }[] = [
  {
    projectSlug: "kjade-baseline-evaluation",
    url: "/images/project-kjade-baseline-tea-monitoring.jpeg",
    caption: "Field monitoring visit to a smallholder tea farm in Meru County.",
    order: 1,
  },
  {
    projectSlug: "kjade-baseline-evaluation",
    url: "/images/project-kjade-baseline-household-interview.jpeg",
    caption: "Household survey interview during the KJADE baseline data collection.",
    order: 2,
  },
  {
    projectSlug: "kjade-baseline-evaluation",
    url: "/images/project-kjade-baseline-training-workshop.jpeg",
    caption: "Stakeholder training and Q&A session on digital agriculture tools.",
    order: 3,
  },
  {
    projectSlug: "kjade-mapping-listing",
    url: "/images/project-kjade-mapping-child-measurement.jpeg",
    caption: "Field team collecting household demographic and nutrition data.",
    order: 1,
  },
  {
    projectSlug: "kjade-mapping-listing",
    url: "/images/project-kjade-mapping-household-interview.jpeg",
    caption: "Enumerator conducting a household listing interview.",
    order: 2,
  },
  {
    projectSlug: "machakos-resilience-feasibility-study",
    url: "/images/project-machakos-resilience-drip-irrigation.jpeg",
    caption: "Drip-irrigated maize and beans demonstrating climate-smart practices.",
    order: 1,
  },
  {
    projectSlug: "machakos-resilience-feasibility-study",
    url: "/images/project-machakos-resilience-site-visit.jpeg",
    caption: "Partner delegation reviewing feasibility study field sites.",
    order: 2,
  },
  {
    projectSlug: "machakos-resilience-feasibility-study",
    url: "/images/project-machakos-resilience-household-interview.jpeg",
    caption: "Household interview supporting the resilience feasibility assessment.",
    order: 3,
  },
  {
    projectSlug: "machakos-resilience-feasibility-study",
    url: "/images/project-machakos-resilience-field-team.jpeg",
    caption: "SAFE Africa field team on assignment in Machakos County.",
    order: 4,
  },
  {
    projectSlug: "restore-africa-baseline-evaluation",
    url: "/images/project-restore-africa-tomato-field.jpeg",
    caption: "Crop monitoring on a tomato farming site under the Restore Africa programme.",
    order: 1,
  },
  {
    projectSlug: "restore-africa-baseline-evaluation",
    url: "/images/project-restore-africa-watermelon-crop.jpeg",
    caption: "Horticulture crop monitoring documenting watermelon production.",
    order: 2,
  },
  {
    projectSlug: "restore-africa-baseline-evaluation",
    url: "/images/project-restore-africa-borehole-pump.jpeg",
    caption: "A hand-pump borehole supporting rural water access.",
    order: 3,
  },
  {
    projectSlug: "seed-systems-injustices-study",
    url: "/images/project-seed-systems-womens-group.jpeg",
    caption: "Women's group engagement as part of the seed systems study.",
    order: 1,
  },
];

const posts = [
  {
    slug: "new-nairobi-office",
    type: "NEWS" as const,
    title: "A new home for our growing team",
    excerpt: "SAFE Africa has moved into a larger Nairobi office to support our expanding portfolio of research, evaluation, and advisory engagements.",
    body: "As our portfolio of research, evaluation, and advisory assignments has grown, so has our team. We've moved into a larger Nairobi office with more room for collaboration, client meetings, and field-team planning sessions, giving us the space we need to keep delivering high-quality evidence for our partners.",
    coverImage: "/images/media-new-office.jpeg",
    publishedAt: new Date("2026-05-12"),
  },
  {
    slug: "team-celebrates-project-milestones",
    type: "NEWS" as const,
    title: "Celebrating the team behind the evidence",
    excerpt: "Our team took time out to celebrate the hard work behind recent milestone assignments, from baseline evaluations to household surveys across Kenya.",
    body: "Behind every baseline evaluation, household survey, and feasibility study is a team that puts in the work — from field enumerators to data analysts. We recently took a moment to celebrate that effort together, marking the completion of several major assignments and the relationships built along the way.",
    coverImage: "/images/media-team-celebration.jpeg",
    publishedAt: new Date("2026-06-20"),
  },
  {
    slug: "hosting-partners-for-a-site-visit",
    type: "NEWS" as const,
    title: "Hosting partners for a project site visit",
    excerpt: "SAFE Africa welcomed partner representatives for a site visit, showcasing our fieldwork and strengthening collaboration on current assignments.",
    body: "Site visits give our partners a first-hand look at how our fieldwork translates into the evidence they rely on. We recently hosted partner representatives at one of our project locations, walking through our data collection processes and discussing how the findings are shaping program decisions.",
    coverImage: "/images/media-partner-site-visit.jpeg",
    publishedAt: new Date("2026-04-18"),
  },
  {
    slug: "safe-africa-at-agritech-digest-scaleup-conference",
    type: "EVENT" as const,
    title: "SAFE Africa at the Agritech Digest Scale-Up Conference",
    excerpt: "Our team joined a panel session on navigating agribusiness growth in Africa, sharing evidence-based perspectives with industry peers.",
    body: "SAFE Africa took part in a panel discussion on navigating agribusiness and agritech scale-up in Africa, joining industry leaders to share perspectives on what it takes to grow evidence-driven agricultural enterprises across the continent. It was a valuable opportunity to connect with partners and peers shaping the sector's future.",
    coverImage: "/images/media-agritech-conference-panel.jpeg",
    eventDate: new Date("2026-03-10"),
    eventLocation: "Nairobi, Kenya",
    publishedAt: new Date("2026-03-10"),
  },
];

const pageSections: { key: string; content: unknown }[] = [
  {
    key: "home.hero",
    content: {
      title: "Smart Agriculture and Food Economics Africa Ltd (SAFE Africa Ltd)",
      subtitle: "Generating Data-Driven Evidence to Improve Livelihoods",
      primaryCta: { label: "Explore Our Work", href: "/projects" },
      secondaryCta: { label: "Contact Us", href: "/contact" },
    },
  },
  {
    key: "home.stats",
    content: {
      stats: [
        { value: "5+", label: "Featured assignments delivered" },
        { value: "11", label: "Counties reached across Kenya" },
        { value: "5,500+", label: "Households reached through fieldwork" },
        { value: "5", label: "Leading development partners" },
      ],
    },
  },
  {
    key: "home.clients",
    content: {
      title: "Who We Work With",
      segments: [
        { name: "Startups", description: "Supporting agritech and food system innovators with research and market insights." },
        { name: "Governments", description: "Providing policy-relevant evidence and program evaluations." },
        { name: "Funding Agencies & NGOs", description: "Delivering impact assessments and sustainability frameworks." },
        { name: "Private Sector", description: "Offering compliance audits, business evaluations, and value chain analysis." },
        { name: "Communities", description: "Empowering local groups through participatory research and capacity building." },
      ],
    },
  },
  {
    key: "home.cta",
    content: {
      title: "Let's generate evidence that moves Africa forward",
      body: "Partner with SAFE Africa for rigorous research, evaluation, and advisory services tailored to your program's goals.",
      button: { label: "Get in Touch", href: "/contact" },
    },
  },
  {
    key: "about.overview",
    content: {
      paragraphs: [
        "SAFE Africa is a Kenya-registered research and consultancy firm that supports governments, development partners, NGOs, and private sector actors with evidence generation, evaluation, and advisory services. Our work spans five thematic areas—Agriculture, Food and Nutrition Systems; Girls' and Women's Empowerment; Youth Skills and Workforce Development; Climate Change Adaptation and Natural Resource Management (including WASH); and Social Protection.",
        "Our multidisciplinary team includes agricultural economists, monitoring and evaluation specialists, environmental researchers, and social inclusion experts with experience delivering assignments across Kenya and other African countries. SAFE Africa designs and implements baseline and endline surveys, impact assessments, feasibility studies, randomized studies, socio-economic analyses, and related research.",
        "To strengthen the quality and relevance of our work, we integrate cross-cutting capabilities such as digital agriculture, climate-smart agriculture, natural resource assessments, and gender-responsive analysis. Guided by values of integrity, equity, innovation, sustainability, and collaboration, we combine technical rigor with professionalism, accountability, and timely delivery.",
        "SAFE Africa generates actionable insights and practical solutions that strengthen institutions, support communities, and advance sustainable and inclusive development across the continent.",
      ],
    },
  },
  {
    key: "about.mission",
    content: {
      mission: "To generate data-driven evidence and advisory solutions that strengthen livelihoods, resilience, and inclusive development across Africa.",
      vision: "An Africa where evidence-informed decisions advance sustainable systems, equitable opportunities, and improved well-being for all.",
    },
  },
  {
    key: "about.values",
    content: {
      values: [
        { name: "Integrity", description: "Upholding transparency and accountability." },
        { name: "Equity", description: "Promoting gender equality and social justice." },
        { name: "Innovation", description: "Driving digital and climate-smart solutions." },
        { name: "Sustainability", description: "Ensuring long-term environmental and social impact." },
        { name: "Collaboration", description: "Partnering with diverse stakeholders for shared success." },
      ],
    },
  },
  {
    key: "about.footprint",
    content: {
      headquarters: "MyOffice Space, 4th Floor, Suite 17, Greenhouse Mall, Ngong Road, Nairobi, Kenya",
      operations: "Across East Africa with partnerships extending to pan-African and global networks.",
    },
  },
  {
    key: "about.approach",
    content: {
      body: "SAFE Africa applies a holistic, participatory, and evidence-driven approach—combining research, consultancy, and capacity building to deliver actionable insights and sustainable solutions.",
    },
  },
];

async function seedCareers() {
  // Reusable "Standard Job Application" template (fixed id → idempotent upsert).
  await prisma.applicationForm.upsert({
    where: { id: STANDARD_FORM_ID },
    update: {
      name: "Standard Job Application",
      description: "Default application form used for survey field roles (enumerators, supervisors, etc.).",
      fields: defaultApplicationFields() as object,
      isTemplate: true,
      requireCv: true,
      resumeStrict: true,
      resumeTemplateUrl: RESUME_TEMPLATE_URL,
    },
    create: {
      id: STANDARD_FORM_ID,
      name: "Standard Job Application",
      description: "Default application form used for survey field roles (enumerators, supervisors, etc.).",
      fields: defaultApplicationFields() as object,
      isTemplate: true,
      requireCv: true,
      resumeStrict: true,
      resumeTemplateUrl: RESUME_TEMPLATE_URL,
    },
  });

  const enumeratorsDescription = `
<h3>About the role</h3>
<p>SAFE Africa is hiring data collection enumerators to support the Kenya Jobs, Agriculture and Digital Ecosystem (K-JADE) household baseline survey, implemented for the World Bank and IFPRI with support from the Bill &amp; Melinda Gates Foundation. Enumerators conduct household interviews using tablets across Makueni, Nakuru, Kirinyaga, and Busia counties.</p>
<h3>Key deliverables</h3>
<ul>
<li>Attend and actively participate in all enumerator training, pretest, and recap sessions.</li>
<li>Conduct household interviews using the SurveyCTO platform, following the interviewer's manual.</li>
<li>Verify, accurately record, and submit completed interviews to the server on a daily basis.</li>
<li>Address data-quality issues communicated by supervisors, survey managers, and the data manager.</li>
<li>Take good care of all tablets and equipment and return them in good condition after the survey.</li>
<li>Observe strict data confidentiality and adhere to the enumerator code of conduct.</li>
</ul>
<h3>Education, knowledge and experience</h3>
<ul>
<li>Recent graduate with a bachelor's degree in Agricultural Economics, Agribusiness Management, General Agriculture, or a related discipline.</li>
<li>Minimum of Second Class Honours, Upper Division.</li>
<li>Good understanding of research ethics, confidentiality, and privacy.</li>
<li>Experience in rural household data collection; prior use of ODK, SurveyCTO, or Survey Solutions is highly preferred.</li>
<li>Keen attention to detail, high integrity, punctuality, and demonstrated teamwork.</li>
<li>Must be available full-time for the entire data collection exercise. Understanding of the local language is an added advantage.</li>
</ul>
<h3>Terms and conditions</h3>
<p>Enumerators are engaged for approximately 9 weeks, including training, tool piloting, and data collection. They receive a training allowance and a per diem during data collection upon approval of daily deliverables, and are provided transport and airtime. Timesheets are required to record actual days worked.</p>
<p><em>You will be required to attach your CV/resume in the specified format. CVs submitted in a different format will not be reviewed.</em></p>`.trim();

  const supervisorsDescription = `
<h3>About the role</h3>
<p>SAFE Africa is hiring supervisors to serve as team leaders for data collection enumerators during the Kenya Jobs, Agriculture and Digital Ecosystem (K-JADE) household baseline survey, implemented for the World Bank and IFPRI. The survey is administered across Makueni, Nakuru, Kirinyaga, and Busia counties.</p>
<h3>Duties and responsibilities</h3>
<ul>
<li>Attend and support enumerator training and facilitate piloting and recap sessions.</li>
<li>Supervise household surveys for all assigned enumerators, coordinating with community contact persons and guiding replacement of missing households.</li>
<li>Review data collected by your team to ensure quality before approving it for upload to the server, and ensure daily submission.</li>
<li>Liaise with survey managers on community interviews and back-checking in selected households.</li>
<li>Organize daily debriefing meetings, handle field expenses prudently, and account for their usage.</li>
<li>Prepare and submit daily tallies, weekly reports, and a final report; enforce strict data confidentiality within your team.</li>
</ul>
<h3>Education, knowledge and experience</h3>
<ul>
<li>Minimum of a bachelor's degree with at least Second Class Honours, Upper Division, in Agricultural Economics, Agribusiness Management, General Agriculture, or a related discipline. A Master's degree is an added advantage.</li>
<li>Past experience supervising data collection teams, or at least three years participating in large-scale rural household data collection in the agricultural sector.</li>
<li>Familiarity with troubleshooting ODK platforms such as ODK, SurveyCTO, or Survey Solutions.</li>
<li>Strong understanding of research ethics, confidentiality, and privacy; ability to provide technical guidance to enumerators.</li>
<li>High integrity, punctuality, leadership, and the ability to work under pressure and meet strict deadlines.</li>
<li>Must be available full-time for the entire data collection exercise.</li>
</ul>
<h3>Terms and conditions</h3>
<p>Supervisors are engaged for approximately 9 weeks, including training, tool piloting, and data collection, with allowances and per diem as per SAFE Africa's field policy.</p>
<p><em>You will be required to attach your CV/resume in the specified format. CVs submitted in a different format will not be reviewed.</em></p>`.trim();

  const vacancies = [
    {
      slug: "kjade-baseline-enumerators",
      title: "Call for Enumerators — K-JADE Baseline Survey",
      type: "JOB" as const,
      location: "Makueni, Nakuru, Kirinyaga & Busia Counties, Kenya",
      summary:
        "Conduct household interviews using tablets (SurveyCTO) for the K-JADE baseline survey across four counties. ~9-week engagement.",
      deadline: new Date("2026-08-31T20:59:00.000Z"),
      description: enumeratorsDescription,
      status: "OPEN" as const,
      formId: STANDARD_FORM_ID,
      resumeStrict: true,
      resumeTemplateUrl: RESUME_TEMPLATE_URL,
    },
    {
      slug: "kjade-baseline-supervisors",
      title: "Call for Supervisors — K-JADE Baseline Survey",
      type: "JOB" as const,
      location: "Makueni, Nakuru, Kirinyaga & Busia Counties, Kenya",
      summary:
        "Lead and provide technical assistance to enumerator teams during the K-JADE baseline survey. ~9-week engagement.",
      deadline: new Date("2025-07-31T20:59:00.000Z"),
      description: supervisorsDescription,
      status: "CLOSED" as const,
      formId: STANDARD_FORM_ID,
      resumeStrict: true,
      resumeTemplateUrl: RESUME_TEMPLATE_URL,
    },
  ];

  for (const vacancy of vacancies) {
    await prisma.vacancy.upsert({ where: { slug: vacancy.slug }, update: vacancy, create: vacancy });
  }
  console.log(`Careers: 1 template form, ${vacancies.length} vacancies`);
}

async function main() {
  await seedAdmin();
  await seedCareers();

  for (const area of thematicAreas) {
    const data = { ...area, description: plainTextToHtml(area.description), impact: plainTextToHtml(area.impact) };
    await prisma.thematicArea.upsert({ where: { slug: area.slug }, update: data, create: data });
  }
  console.log(`Thematic areas: ${thematicAreas.length}`);

  for (const service of services) {
    const data = { ...service, description: plainTextToHtml(service.description) };
    await prisma.service.upsert({ where: { slug: service.slug }, update: data, create: data });
  }
  console.log(`Services: ${services.length}`);

  for (const { areas, ...project } of projects) {
    const connect = { connect: areas.map((slug) => ({ slug })) };
    const content = {
      ...project,
      overview: plainTextToHtml(project.overview),
      role: plainTextToHtml(project.role),
      scaleResults: plainTextToHtml(project.scaleResults),
    };
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: { ...content, status: "PUBLISHED", featured: true, thematicAreas: { set: [], ...connect } },
      create: { ...content, status: "PUBLISHED", featured: true, thematicAreas: connect },
    });
  }
  console.log(`Projects: ${projects.length}`);

  for (const slug of new Set(projectImages.map((image) => image.projectSlug))) {
    const project = await prisma.project.findUnique({ where: { slug }, select: { id: true } });
    if (!project) continue;
    await prisma.projectImage.deleteMany({ where: { projectId: project.id } });
    await prisma.projectImage.createMany({
      data: projectImages
        .filter((image) => image.projectSlug === slug)
        .map(({ url, caption, order }) => ({ url, caption, order, projectId: project.id })),
    });
  }
  console.log(`Project images: ${projectImages.length}`);

  for (const post of posts) {
    const data = { ...post, body: plainTextToHtml(post.body) };
    await prisma.post.upsert({ where: { slug: post.slug }, update: data, create: data });
  }
  console.log(`Posts: ${posts.length}`);

  for (const section of pageSections) {
    await prisma.pageSection.upsert({
      where: { key: section.key },
      update: { content: section.content as object },
      create: { key: section.key, content: section.content as object },
    });
  }
  console.log(`Page sections: ${pageSections.length}`);

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      address: "MyOffice Space, 4th Floor, Suite 17, Greenhouse Mall, Ngong Road, Nairobi, Kenya",
      poBox: "University of Nairobi, P.O. BOX 8028-00200, Nairobi, Kenya",
      phone: "+254 742 322 296",
      email: "info@safeafrika.com",
      socialLinks: { linkedin: "", twitter: "", facebook: "" },
      impactStats: {},
      mapEmbedUrl: null,
    },
  });
  console.log("Site settings ready");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
