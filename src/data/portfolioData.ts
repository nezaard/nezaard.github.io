import {
  SpatialWorkItem,
  PhilosophyPillar,
  ArchiveEntry,
  SpatialSection,
} from "../types";

export const ARTIST_INFO = {
  name: "Nezard Wildan Kurniawan Syah",
  shortName: "Nezard Wildan",
  role: "System Engineer & Storage Enterprise Specialist",
  email: "wildannezard@gmail.com",
  location: "Jakarta, Indonesia · Available for Global Remote & On-Site Roles",
  statement:
    "Managing and optimizing enterprise IT infrastructure across multi-site environments, specializing in NetApp enterprise storage, ONTAP administration, SAN infrastructure, disaster recovery operations, and Linux & Windows server management.",
  heroSubline:
    "Enterprise Infrastructure · NetApp Storage · SAN Operations · Disaster Recovery",
  recognitions: [
    {
      label: "Infrastructure Monitoring",
      value: "500+",
      detail: "Servers & Storage Devices",
    },
    {
      label: "Enterprise Storage",
      value: "NetApp",
      detail: "ONTAP Administration & Troubleshooting",
    },
    {
      label: "Multi-Site Operations",
      value: "3+",
      detail: "Head Office & Distributed Infrastructure Sites",
    },
    {
      label: "Infrastructure Experience",
      value: "4+ Years",
      detail: "Enterprise IT Infrastructure Operations",
    },
  ],
};

export const CAMERA_WAYPOINTS: Record<
  SpatialSection,
  {
    position: [number, number, number];
    lookAt: [number, number, number];
    label: string;
    index: string;
  }
> = {
  overview: {
    position: [0, 0.2, 13.5],
    lookAt: [0, 0, 0],
    label: "Overview",
    index: "00",
  },
  work: {
    position: [8.8, 0.4, 8.2],
    lookAt: [5.2, 0.1, -1.5],
    label: "Projects",
    index: "01",
  },
  philosophy: {
    position: [-8.5, 2.2, 8.8],
    lookAt: [-2.0, 0.5, 0],
    label: "About",
    index: "02",
  },
  archive: {
    position: [0, -6.8, 10.5],
    lookAt: [0, -1.5, 0],
    label: "Skills & Certs",
    index: "03",
  },
  contact: {
    position: [0, 0.8, 6.2],
    lookAt: [0, 0.2, 0],
    label: "Contact",
    index: "04",
  },
};

export const SELECTED_WORKS: SpatialWorkItem[] = [
  {
    id: "project-dc-drc",
    index: "01",
    title: "Enterprise DC-DRC Transformation",
    subtitle:
      "Multi-Site Data Center Relocation & Disaster Recovery Infrastructure",

    discipline:
      "NetApp Enterprise · Final Disaster Recovery Validation & Production Readiness · SnapMirror · Data Protection",

    year: "2024 - 2026",

    client: "Enterprise Data Center (2 Sites)",

    description:
      "Led the infrastructure planning and technical execution of a multi-site Data Center and Disaster Recovery Center transformation, covering hardware tech refresh, storage controller expansion, SAN fabric restructuring, infrastructure relocation, and disaster recovery role reversal between two enterprise data center facilities. Coordinated vendor activities, redesigned rack layouts for cost efficiency, implemented SAN zoning and LUN mapping, and executed NetApp SnapMirror reverse resynchronization to transition production workloads between sites.",

    conceptNotes: [
      "Infrastructure site assessment, rack optimization, power capacity planning, and physical topology redesign across primary and disaster recovery facilities",
      "Brocade G720 SAN fabric deployment, G610 switch relocation, SAN zoning restructuring, and redundant fabric integration for enterprise storage environments",
      "NetApp AFF-A400 controller expansion, cluster integration, and storage infrastructure commissioning at both data center locations",
      "DRC provisioning through SAN zoning, WWPN configuration, LUN mapping, and LUN masking for designated production hosts",
      "Mellanox switch integration to establish Ethernet-based SnapMirror replication connectivity for NetApp storage systems",
      "Vendor supervision throughout infrastructure relocation, including shutdown procedures, cable mapping, equipment transportation, re-racking, and recommissioning",
      "Disaster recovery simulation, storage accessibility validation, and data integrity testing before production role reversal",
      "Production data center role reversal through NetApp SnapMirror reverse resynchronization, transitioning Dawuan into the primary site and PIK into the disaster recovery site",
    ],

    metrics: [
      { label: "Data Center Sites", value: "2" },
      { label: "Storage Environments", value: "2" },
      { label: "SAN Fabric Upgrade", value: "G720 / G610" },
    ],
    palette: {
      primary: "#e0f2fe",
      secondary: "#0284c7",
      accent: "#38bdf8",
    },
    position3D: [3.8, 1.35, -0.8],
    rotation3D: [0, -0.32, 0],
  },
  {
    id: "project-storage-san-refresh",
    index: "02",
    title: "Enterprise Storage & SAN Modernization",
    subtitle: "Zero-Downtime Storage Migration & SAN Fabric Technology Refresh",

    discipline: "NetApp Enterprise · SnapMirror · Brocade SAN · Data Migration",

    year: "2023 - Now",

    client: "Enterprise Data Center Infrastructure",

    description:
      "Executed enterprise storage and SAN infrastructure modernization through a non-disruptive technology refresh approach, replacing legacy storage systems and SAN switches while maintaining continuous production service availability. Implemented parallel storage deployment, SnapMirror-based data migration, synchronized LUN cutover, and controlled SAN fabric hardware replacement. Successfully transitioned new storage systems into primary production environments while retaining legacy storage infrastructure as Disaster Recovery resources.",

    conceptNotes: [
      "Parallel Storage Deployment: Provisioned and configured new NetApp storage infrastructure alongside existing production systems, preparing the target environment before migration",
      "SnapMirror Data Migration: Established replication relationships between legacy and new storage systems, transferring production datasets while maintaining synchronization throughout the migration process",
      "Data Synchronization & Cutover: Monitored SnapMirror replication until all target volumes reached synchronized status, then performed controlled SnapMirror break operations to prepare the new storage for production activation",
      "LUN Migration & Host Integration: Mapped newly provisioned LUNs from the target storage to designated production hosts, followed by host-side storage rescanning and accessibility validation",
      "Data Integrity Verification: Validated migrated data, LUN accessibility, host connectivity, and storage readiness before transitioning production workloads to the new storage infrastructure",
      "Legacy Storage Reassignment: Reconfigured former production storage systems as Disaster Recovery resources, preserving their role within the enterprise storage protection architecture",
      "SAN Switch Configuration Replication: Prepared replacement Brocade SAN switches by reproducing existing fabric configurations, including zoning, WWPN assignments, and relevant connectivity settings",
      "Controlled Fibre Channel Migration: Transferred existing Fibre Channel connections from legacy SAN switches to replacement switches one connection at a time, validating link status and fabric connectivity throughout the process",
      "Non-Disruptive SAN Cutover: Leveraged controlled port-by-port migration and existing infrastructure redundancy to maintain host-to-storage connectivity during SAN switch replacement",
      "Post-Migration Validation: Performed final verification of SAN fabric health, host multipathing, storage accessibility, and production connectivity after hardware transition",
    ],

    metrics: [
      { label: "Production Downtime", value: "Zero" },
      { label: "Migration Method", value: "SnapMirror" },
      { label: "SAN Migration", value: "Live FC Cutover" },
      { label: "Legacy Infrastructure", value: "DRC Reassignment" },
    ],
    palette: {
      primary: "#e0e7ff",
      secondary: "#4f46e5",
      accent: "#818cf8",
    },
    position3D: [6.4, 1.35, -2.2],
    rotation3D: [0, -0.48, 0],
  },
  {
    id: "project-server-infrastructure",
    index: "03",
    title: "Enterprise Server Infrastructure Deployment",
    subtitle:
      "Multi-Site Server Provisioning & Hardware Lifecycle Modernization",

    discipline:
      "Enterprise Server · Linux · Windows Server · Hardware Deployment",

    year: "2022 - Now",

    client: "Enterprise IT Infrastructure (Head Office & Branches)",

    description:
      "Managed the technical planning and execution of enterprise server infrastructure deployment and hardware technology refresh across Head Office and distributed branch environments. Responsibilities included evaluating infrastructure requirements based on user requests, preparing server hardware specifications, coordinating deployment activities, performing physical installation, and executing server provisioning to support new infrastructure demands and existing system modernization initiatives.",

    conceptNotes: [
      "Infrastructure Requirement Assessment: Analyzed server deployment requests and technical requirements submitted by internal users to determine appropriate infrastructure resources",
      "Server Hardware Planning: Prepared hardware specifications, resource requirements, and deployment configurations based on application workloads and operational needs",
      "Hardware Tech Refresh: Executed replacement and modernization of existing server infrastructure across Head Office and distributed branch environments",
      "New Server Deployment: Performed physical server installation, rack mounting, power connectivity, network connectivity, and initial hardware configuration",
      "Server Provisioning: Executed server setup and configuration according to approved technical requirements and infrastructure standards",
      "Multi-Site Infrastructure Execution: Coordinated server deployment activities across Head Office facilities and geographically distributed branch locations",
      "Post-Deployment Validation: Performed hardware health checks, network connectivity verification, and infrastructure readiness validation before operational handover",
      "Cross-Team Coordination: Collaborated with internal IT teams, application owners, and relevant stakeholders to ensure infrastructure delivery aligned with user requirements",
    ],

    metrics: [
      { label: "Deployment Coverage", value: "Multi-Site" },
      { label: "Infrastructure Scope", value: "500+ Monitored" },
      { label: "Deployment Type", value: "New & Refresh" },
    ],
    palette: {
      primary: "#d1fae5",
      secondary: "#059669",
      accent: "#34d399",
    },
    position3D: [3.8, -1.15, -0.8],
    rotation3D: [0, -0.32, 0],
  },
];

export const PHILOSOPHY_PILLARS: PhilosophyPillar[] = [
  {
    index: "01",
    title: "Data Center & Disaster Recovery Management",
    italicLead:
      "Business continuity is built through careful planning, resilient infrastructure, and reliable execution.",
    body: "Experienced in managing and executing enterprise data center and disaster recovery infrastructure operations across multiple sites. Hands-on involvement in DC-DRC transformation, infrastructure relocation, storage expansion, hardware technology refresh, disaster recovery simulation, and production role reversal. Skilled in coordinating technical activities, overseeing infrastructure changes, validating replication readiness, and ensuring critical systems remain reliable throughout infrastructure transitions."
  },
  {
    index: "02",
    title: "Infrastructure Project Engineering & Execution",
    italicLead:
      "Successful infrastructure projects demand more than technical knowledge—they require ownership, coordination, and disciplined execution.",
    body: "Experienced in planning and executing enterprise infrastructure projects, from initial technical assessment and resource preparation to implementation, validation, and production handover. Involved in leading technical execution for storage and SAN technology refresh, server deployment, infrastructure relocation, and hardware integration. Working closely with internal IT teams, database administrators, vendors, and business stakeholders to translate infrastructure requirements into reliable technical implementations."
  },
  {
    index: "03",
    title: "Enterprise Systems & Infrastructure Operations",
    italicLead:
      "Operational excellence comes from consistency, proactive monitoring, and the ability to resolve complex technical challenges.",
    body: "Responsible for monitoring, maintaining, and troubleshooting enterprise server and storage infrastructure across head office and distributed branch environments. Supporting more than 500 server and storage devices, with hands-on experience in NetApp ONTAP administration, Linux systems, server provisioning, storage management, SAN connectivity, and infrastructure health monitoring. Focused on operational stability, incident resolution, service reliability, and continuous infrastructure improvement."
  },
];


export const ARCHIVE_ENTRIES: ArchiveEntry[] = [
  {
    index: "01",
    title: "NetApp Enterprise Storage Administration",
    medium: "Core Expertise · AFF All-Flash & FAS Hybrid",
    year: "Specialization",
    note: "NetApp ONTAP 9.x administration, cluster management, storage provisioning, aggregate and volume management, LUN provisioning, SVM administration, Snapshot management, storage expansion, and performance troubleshooting.",
  },
  {
    index: "02",
    title: "Storage Replication & Disaster Recovery",
    medium: "Enterprise Data Protection · SnapMirror",
    year: "Specialization",
    note: "SnapMirror configuration and monitoring, replication relationship management, resynchronization, reverse resync, DR simulation, storage role reversal, data synchronization, and recovery operations across primary and secondary data center environments.",
  },
  {
    index: "03",
    title: "Enterprise SAN Infrastructure Management",
    medium: "Brocade Fibre Channel · G720, G610, Brocade 300, Brocade 6505",
    year: "Specialization",
    note: "SAN switch administration, Fabric OS configuration, WWPN management, zoning, fabric restructuring, Fibre Channel connectivity, LUN mapping, SAN hardware refresh, and host-to-storage connectivity troubleshooting.",
  },
  {
    index: "04",
    title: "Data Center Infrastructure & Operations",
    medium: "Multi-Site Infrastructure · DC & DRC",
    year: "Specialization",
    note: "Data center site assessment, rack layout optimization, hardware deployment, power and cabling coordination, infrastructure relocation, vendor supervision, equipment commissioning, disaster recovery validation, and production readiness.",
  },
  {
    index: "05",
    title: "Enterprise Server Linux & Windows Administration",
    medium: "Linux & Windows Systems · Server Deployment & Monitoring",
    year: "Specialization",
    note: "Linux & Windows server administration, server provisioning, hardware configuration, operating system installation, system health monitoring, infrastructure troubleshooting, server technology refresh, and deployment across head office and distributed branch environments.",
  },
  {
    index: "06",
    title: "Infrastructure Project Coordination",
    medium: "Technical Planning · Implementation · Execution",
    year: "Professional Practice",
    note: "Technical requirement assessment, infrastructure resource planning, implementation coordination, vendor supervision, cross-team collaboration, change execution, technical validation, issue resolution, and production handover.",
  },
];
