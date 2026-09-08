import type { CourseWithEditions } from "@/contracts";

/**
 * Catálogo de formação — dados de demonstração.
 *
 * ATENÇÃO: os PROGRAMAS são reais e correspondem aos domínios oficiais de
 * cada certificação. Já os PREÇOS, DATAS, CAPACIDADES e NOMES DE FORMADOR
 * são fictícios e servem apenas para a interface ter conteúdo plausível
 * enquanto não existe base de dados.
 *
 * Regra do WP-A.06 do SoW: nenhum destes valores vai para produção. São
 * substituídos por conteúdo real no WP-A.12, e a página assinala-os como
 * exemplo enquanto SEED_DATA for verdadeiro.
 */
export const SEED_DATA = true;

/**
 * Enquanto os dados forem de demonstração, o site NÃO mostra publicamente
 * nenhum número inventado — preço, vaga ou data — nem aceita pré-inscrições
 * que não vão a lado nenhum.
 *
 * O motivo é simples: wilit.ao é o endereço comercial da empresa. Um preço
 * fictício numa página pública vira uma expectativa no cliente, e um
 * formulário que descarta submissões faz a pessoa julgar que reservou lugar
 * enquanto a WIL IT nunca soube que ela existiu.
 *
 * Os programas, a duração e a modalidade são reais e ficam visíveis: dão
 * valor comercial à página e o interesse é encaminhado para os canais que
 * já funcionam — email e WhatsApp.
 *
 * Passa a false no WP-A.12, quando houver preços reais e persistência.
 */
export const DADOS_PUBLICAVEIS = false;

const iso = (d: string) => new Date(d).toISOString();
const NOW = iso("2026-09-01T08:00:00Z");

/** Preços de exemplo por plano, em kwanzas. */
function precos(base: number) {
  return [
    { plan: "essencial" as const, priceAOA: base, available: true },
    { plan: "certificacao" as const, priceAOA: Math.round(base * 1.45), available: true },
    { plan: "performance" as const, priceAOA: Math.round(base * 1.9), available: true },
    { plan: "corporativo" as const, priceAOA: 0, available: false },
  ];
}

export const COURSES: CourseWithEditions[] = [
  {
    id: "11111111-1111-4111-8111-000000000001",
    code: "CCNA-200-301",
    slug: "ccna-200-301",
    title: "CCNA — Implementing and Administering Cisco Solutions",
    certification: "Cisco CCNA 200-301",
    area: "redes",
    level: "iniciante",
    summary:
      "A certificação de entrada mais reconhecida em redes. Cobre desde o modelo de camadas até à configuração de routers e switches Cisco, com prática em laboratório do primeiro ao último dia.",
    objectives: [
      "Explicar o funcionamento de redes IP, do endereçamento ao encaminhamento",
      "Configurar e diagnosticar switching de camada 2, VLANs e trunking",
      "Configurar encaminhamento estático e OSPF numa área",
      "Implementar serviços de rede: DHCP, NAT, NTP, DNS e QoS",
      "Aplicar fundamentos de segurança, listas de acesso e segurança de portas",
      "Compreender automação de rede, APIs REST e controladores",
    ],
    targetAudience: [
      "Técnicos de informática que queiram especializar-se em redes",
      "Estudantes finalistas de engenharia informática ou telecomunicações",
      "Profissionais de suporte que trabalhem com infraestrutura",
    ],
    prerequisites: [
      "Conhecimentos básicos de informática e sistemas operativos",
      "Não é exigida experiência prévia em redes",
    ],
    syllabus: [
      { title: "Fundamentos de rede", topics: ["Componentes e topologias", "Meios físicos e cabos", "Modelo TCP/IP", "Endereçamento IPv4 e sub-redes", "Fundamentos de IPv6"] },
      { title: "Acesso à rede", topics: ["VLANs e trunking 802.1Q", "Spanning Tree", "EtherChannel", "Redes sem fios e WLC"] },
      { title: "Conectividade IP", topics: ["Tabela de encaminhamento", "Rotas estáticas", "OSPFv2 de área única", "Redundância de gateway"] },
      { title: "Serviços IP", topics: ["NAT e PAT", "DHCP e DNS", "NTP e SNMP", "Syslog", "QoS"] },
      { title: "Fundamentos de segurança", topics: ["Ameaças e mitigação", "AAA", "Listas de controlo de acesso", "Port security", "Segurança de rede sem fios"] },
      { title: "Automação e programabilidade", topics: ["Redes controladas por software", "APIs REST", "JSON", "Ansible, Puppet e Chef"] },
    ],
    durationHours: 120,
    instructorName: null,
    coverImageUrl: null,
    status: "publicado",
    createdAt: NOW,
    updatedAt: NOW,
    editions: [
      {
        id: "22222222-2222-4222-8222-000000000001",
        courseId: "11111111-1111-4111-8111-000000000001",
        code: "CCNA-2026-04",
        modality: "presencial",
        location: "Luanda — Talatona",
        startDate: "2026-10-13",
        endDate: "2026-12-19",
        schedule: "Segunda, quarta e sexta, 18h00–21h00",
        capacity: 20,
        confirmedCount: 9,
        reservedCount: 2,
        prices: precos(185000),
        status: "inscricoes_abertas",
      },
      {
        id: "22222222-2222-4222-8222-000000000002",
        courseId: "11111111-1111-4111-8111-000000000001",
        code: "CCNA-2026-05",
        modality: "online",
        location: "Sala virtual",
        startDate: "2026-11-10",
        endDate: "2027-01-30",
        schedule: "Terça e quinta, 19h00–22h00",
        capacity: 30,
        confirmedCount: 4,
        reservedCount: 1,
        prices: precos(155000),
        status: "inscricoes_abertas",
      },
    ],
  },
  {
    id: "11111111-1111-4111-8111-000000000002",
    code: "N10-009",
    slug: "comptia-network-plus",
    title: "CompTIA Network+",
    certification: "CompTIA Network+ N10-009",
    area: "redes",
    level: "iniciante",
    summary:
      "Certificação neutra de fabricante que valida os fundamentos de redes. Boa porta de entrada para quem quer bases sólidas antes de escolher um caminho Cisco, Fortinet ou Check Point.",
    objectives: [
      "Dominar conceitos de rede independentes de fabricante",
      "Implementar cablagem, endereçamento e serviços de rede",
      "Operar e monitorizar redes em produção",
      "Reconhecer e mitigar ameaças comuns",
      "Diagnosticar avarias com metodologia estruturada",
    ],
    targetAudience: [
      "Quem está a começar em redes e quer uma base neutra",
      "Técnicos de helpdesk a evoluir para infraestrutura",
      "Estudantes do ensino médio técnico e universitário",
    ],
    prerequisites: ["Conhecimentos básicos de informática"],
    syllabus: [
      { title: "Conceitos de rede", topics: ["Modelo OSI", "Topologias", "Endereçamento IP", "Portas e protocolos", "Serviços na cloud"] },
      { title: "Implementação", topics: ["Cablagem e conectores", "Configuração de switching e routing", "Redes sem fios"] },
      { title: "Operações", topics: ["Monitorização", "Documentação", "Alta disponibilidade", "Recuperação de desastre"] },
      { title: "Segurança", topics: ["Conceitos de segurança", "Ataques comuns", "Endurecimento de rede", "Acesso remoto"] },
      { title: "Diagnóstico", topics: ["Metodologia de resolução", "Ferramentas de diagnóstico", "Avarias de cablagem e de serviço"] },
    ],
    durationHours: 90,
    instructorName: null,
    coverImageUrl: null,
    status: "publicado",
    createdAt: NOW,
    updatedAt: NOW,
    editions: [
      {
        id: "22222222-2222-4222-8222-000000000003",
        courseId: "11111111-1111-4111-8111-000000000002",
        code: "NET-2026-02",
        modality: "hibrido",
        location: "Luanda — Talatona e sala virtual",
        startDate: "2026-10-06",
        endDate: "2026-12-05",
        schedule: "Sábados, 09h00–14h00",
        capacity: 24,
        confirmedCount: 11,
        reservedCount: 3,
        prices: precos(140000),
        status: "inscricoes_abertas",
      },
    ],
  },
  {
    id: "11111111-1111-4111-8111-000000000003",
    code: "ENCOR-350-401",
    slug: "encor-350-401",
    title: "ENCOR — Implementing Cisco Enterprise Network Core Technologies",
    certification: "Cisco 350-401 ENCOR",
    area: "redes",
    level: "avancado",
    summary:
      "O exame nuclear das certificações CCNP Enterprise e CCIE Enterprise Infrastructure. Aprofunda arquitectura, virtualização, garantia de serviço, segurança e automação em redes de grande dimensão.",
    objectives: [
      "Desenhar arquitecturas empresariais e escolher modelos de alta disponibilidade",
      "Implementar virtualização de rede, VRF, GRE e IPsec",
      "Configurar EIGRP, OSPF e BGP em ambiente empresarial",
      "Implementar redes sem fios empresariais e roaming",
      "Aplicar garantia de serviço com SPAN, IP SLA e NetFlow",
      "Automatizar com Python, REST e modelos de dados",
    ],
    targetAudience: [
      "Engenheiros de rede com CCNA ou experiência equivalente",
      "Administradores de infraestrutura em ambientes multi-sede",
    ],
    prerequisites: [
      "CCNA ou conhecimentos equivalentes",
      "Experiência prática com routing e switching",
    ],
    syllabus: [
      { title: "Arquitectura", topics: ["Desenho hierárquico", "Alta disponibilidade", "SD-WAN e SD-Access", "QoS empresarial"] },
      { title: "Virtualização", topics: ["Virtualização de dispositivos", "VRF", "Túneis GRE e IPsec", "LISP e VXLAN"] },
      { title: "Infraestrutura", topics: ["Camada 2 avançada", "EIGRP e OSPF", "BGP", "Redes sem fios empresariais"] },
      { title: "Garantia de serviço", topics: ["Diagnóstico", "SPAN e RSPAN", "IP SLA", "NetFlow e SNMP"] },
      { title: "Segurança", topics: ["Controlo de acesso", "AAA e TACACS+", "Segurança de infraestrutura", "REST API security"] },
      { title: "Automação", topics: ["Python para redes", "EEM", "Modelos de dados e YANG", "DNA Center"] },
    ],
    durationHours: 140,
    instructorName: null,
    coverImageUrl: null,
    status: "publicado",
    createdAt: NOW,
    updatedAt: NOW,
    editions: [
      {
        id: "22222222-2222-4222-8222-000000000004",
        courseId: "11111111-1111-4111-8111-000000000003",
        code: "ENCOR-2026-01",
        modality: "presencial",
        location: "Luanda — Talatona",
        startDate: "2026-11-03",
        endDate: "2027-02-13",
        schedule: "Terça e quinta, 18h00–21h30",
        capacity: 15,
        confirmedCount: 12,
        reservedCount: 2,
        prices: precos(320000),
        status: "inscricoes_abertas",
      },
    ],
  },
  {
    id: "11111111-1111-4111-8111-000000000004",
    code: "ENARSI-300-410",
    slug: "enarsi-300-410",
    title: "ENARSI — Implementing Cisco Enterprise Advanced Routing and Services",
    certification: "Cisco 300-410 ENARSI",
    area: "redes",
    level: "avancado",
    summary:
      "Exame de concentração do CCNP Enterprise, dedicado a encaminhamento avançado, serviços de VPN e diagnóstico em profundidade.",
    objectives: [
      "Implementar e diagnosticar EIGRP, OSPF e BGP em cenários complexos",
      "Configurar redistribuição de rotas e políticas de encaminhamento",
      "Implementar MPLS de camada 3 e DMVPN",
      "Proteger a infraestrutura com ACL, uRPF e control plane policing",
      "Diagnosticar serviços de infraestrutura e conectividade",
    ],
    targetAudience: [
      "Engenheiros de rede que já dominam o ENCOR",
      "Especialistas em encaminhamento empresarial",
    ],
    prerequisites: ["ENCOR 350-401 ou experiência avançada em encaminhamento"],
    syllabus: [
      { title: "Camada 3", topics: ["EIGRP avançado", "OSPF multi-área", "BGP e políticas", "Redistribuição e filtragem"] },
      { title: "Serviços VPN", topics: ["MPLS L3VPN", "DMVPN", "Túneis e encapsulamento"] },
      { title: "Segurança da infraestrutura", topics: ["ACL", "uRPF", "Control plane policing", "Device hardening"] },
      { title: "Serviços de infraestrutura", topics: ["DHCP e DNS", "SNMP e Syslog", "IP SLA", "NetFlow", "Diagnóstico"] },
    ],
    durationHours: 120,
    instructorName: null,
    coverImageUrl: null,
    status: "publicado",
    createdAt: NOW,
    updatedAt: NOW,
    editions: [
      {
        id: "22222222-2222-4222-8222-000000000005",
        courseId: "11111111-1111-4111-8111-000000000004",
        code: "ENARSI-2026-01",
        modality: "online",
        location: "Sala virtual",
        startDate: "2027-01-12",
        endDate: "2027-04-01",
        schedule: "Segunda e quarta, 19h00–22h00",
        capacity: 15,
        confirmedCount: 2,
        reservedCount: 0,
        prices: precos(295000),
        status: "inscricoes_abertas",
      },
    ],
  },
  {
    id: "11111111-1111-4111-8111-000000000005",
    code: "NSE4-7.6",
    slug: "fortinet-nse4-fortios",
    title: "Fortinet NSE 4 — FortiOS 7.6 Administrator",
    certification: "Fortinet NSE 4",
    area: "ciberseguranca",
    level: "intermedio",
    summary:
      "Administração de firewalls FortiGate no dia a dia: políticas, NAT, VPN, inspecção de conteúdo e SD-WAN. A certificação Fortinet mais procurada pelo mercado angolano.",
    objectives: [
      "Configurar políticas de firewall e NAT em FortiGate",
      "Implementar autenticação de utilizadores e Fortinet Single Sign-On",
      "Configurar SSL VPN e IPsec VPN site a site",
      "Aplicar perfis de segurança: antivírus, filtragem web, controlo de aplicações e IPS",
      "Configurar encaminhamento, SD-WAN e alta disponibilidade",
      "Diagnosticar com logs, sniffer e depuração",
    ],
    targetAudience: [
      "Administradores de segurança e de rede",
      "Técnicos que operem firewalls Fortinet",
      "Profissionais de NOC e SOC",
    ],
    prerequisites: [
      "Conhecimentos de TCP/IP e encaminhamento",
      "Recomenda-se CCNA ou Network+",
    ],
    syllabus: [
      { title: "Introdução ao FortiGate", topics: ["Arquitectura", "Configuração inicial", "Administração e perfis"] },
      { title: "Políticas e NAT", topics: ["Políticas de firewall", "SNAT e DNAT", "Objectos de endereço e serviço"] },
      { title: "Autenticação", topics: ["Utilizadores locais e remotos", "LDAP e RADIUS", "FSSO", "Portal cativo"] },
      { title: "VPN", topics: ["SSL VPN em modo túnel e web", "IPsec site a site", "Diagnóstico de VPN"] },
      { title: "Perfis de segurança", topics: ["Antivírus", "Filtragem web e DNS", "Controlo de aplicações", "IPS", "Inspecção SSL"] },
      { title: "Rede e disponibilidade", topics: ["Encaminhamento", "SD-WAN", "Alta disponibilidade", "Logs e diagnóstico"] },
    ],
    durationHours: 80,
    instructorName: null,
    coverImageUrl: null,
    status: "publicado",
    createdAt: NOW,
    updatedAt: NOW,
    editions: [
      {
        id: "22222222-2222-4222-8222-000000000006",
        courseId: "11111111-1111-4111-8111-000000000005",
        code: "NSE4-2026-03",
        modality: "presencial",
        location: "Luanda — Talatona",
        startDate: "2026-10-20",
        endDate: "2026-12-12",
        schedule: "Terça e quinta, 18h00–21h00",
        capacity: 16,
        confirmedCount: 14,
        reservedCount: 2,
        prices: precos(240000),
        status: "inscricoes_abertas",
      },
    ],
  },
  {
    id: "11111111-1111-4111-8111-000000000006",
    code: "NSE5-FMG-7.6",
    slug: "fortinet-nse5-fortimanager",
    title: "Fortinet NSE 5 — FortiManager 7.6 Administrator",
    certification: "Fortinet NSE 5",
    area: "ciberseguranca",
    level: "avancado",
    summary:
      "Gestão centralizada de parques FortiGate com FortiManager: domínios administrativos, pacotes de políticas, provisionamento e actualizações em escala.",
    objectives: [
      "Registar e organizar dispositivos em domínios administrativos",
      "Gerir pacotes de políticas e objectos partilhados",
      "Provisionar configurações e modelos em escala",
      "Gerir actualizações de firmware e serviços FortiGuard",
      "Diagnosticar sincronização entre FortiManager e FortiGate",
    ],
    targetAudience: [
      "Administradores com NSE 4 que gerem vários FortiGate",
      "Equipas de operações de segurança em ambientes multi-sede",
    ],
    prerequisites: ["NSE 4 ou experiência equivalente em FortiOS"],
    syllabus: [
      { title: "Introdução", topics: ["Arquitectura do FortiManager", "Modos de operação", "Configuração inicial"] },
      { title: "Domínios administrativos", topics: ["ADOM", "Fluxos de trabalho", "Perfis administrativos"] },
      { title: "Gestão de dispositivos", topics: ["Registo", "Instalação de configuração", "Revisões e reversão"] },
      { title: "Políticas e objectos", topics: ["Pacotes de políticas", "Objectos partilhados", "Políticas globais"] },
      { title: "Provisionamento", topics: ["Modelos de provisionamento", "Scripts", "Actualizações de firmware", "FortiGuard"] },
    ],
    durationHours: 60,
    instructorName: null,
    coverImageUrl: null,
    status: "publicado",
    createdAt: NOW,
    updatedAt: NOW,
    editions: [
      {
        id: "22222222-2222-4222-8222-000000000007",
        courseId: "11111111-1111-4111-8111-000000000006",
        code: "NSE5-2026-01",
        modality: "online",
        location: "Sala virtual",
        startDate: "2027-01-19",
        endDate: "2027-03-05",
        schedule: "Segunda e quarta, 19h00–22h00",
        capacity: 14,
        confirmedCount: 3,
        reservedCount: 1,
        prices: precos(210000),
        status: "inscricoes_abertas",
      },
    ],
  },
  {
    id: "11111111-1111-4111-8111-000000000007",
    code: "CCSA-R81",
    slug: "checkpoint-ccsa",
    title: "Check Point CCSA — Certified Security Administrator",
    certification: "Check Point CCSA R81.20",
    area: "ciberseguranca",
    level: "intermedio",
    summary:
      "Administração de gateways Check Point: política de segurança, NAT, identidade, monitorização e cópias de segurança na arquitectura de três camadas.",
    objectives: [
      "Compreender a arquitectura de gestão distribuída da Check Point",
      "Criar e instalar políticas de segurança unificadas",
      "Configurar NAT estático e dinâmico",
      "Implementar Identity Awareness e controlo de acesso por utilizador",
      "Monitorizar tráfego com SmartConsole e gerir licenciamento",
    ],
    targetAudience: [
      "Administradores de segurança que operem gateways Check Point",
      "Técnicos de rede a especializar-se em firewalls empresariais",
    ],
    prerequisites: ["Conhecimentos de TCP/IP, administração de Windows e Unix"],
    syllabus: [
      { title: "Arquitectura", topics: ["Três camadas", "SmartConsole", "Security Management Server", "Gateways"] },
      { title: "Política de segurança", topics: ["Camadas de política", "Regras e objectos", "Instalação de política"] },
      { title: "NAT", topics: ["NAT automático e manual", "Hide e Static NAT"] },
      { title: "Identidade e acesso", topics: ["Identity Awareness", "Application Control", "URL Filtering"] },
      { title: "Operação", topics: ["Logs e monitorização", "Cópias de segurança", "Licenciamento e contratos"] },
    ],
    durationHours: 80,
    instructorName: null,
    coverImageUrl: null,
    status: "publicado",
    createdAt: NOW,
    updatedAt: NOW,
    editions: [
      {
        id: "22222222-2222-4222-8222-000000000008",
        courseId: "11111111-1111-4111-8111-000000000007",
        code: "CCSA-2026-02",
        modality: "hibrido",
        location: "Luanda — Talatona e sala virtual",
        startDate: "2026-11-17",
        endDate: "2027-01-22",
        schedule: "Sábados, 09h00–14h00",
        capacity: 16,
        confirmedCount: 6,
        reservedCount: 2,
        prices: precos(250000),
        status: "inscricoes_abertas",
      },
    ],
  },
  {
    id: "11111111-1111-4111-8111-000000000008",
    code: "CCSE-R81",
    slug: "checkpoint-ccse",
    title: "Check Point CCSE — Certified Security Expert",
    certification: "Check Point CCSE R81.20",
    area: "ciberseguranca",
    level: "avancado",
    summary:
      "Nível avançado da Check Point: actualizações, clustering e alta disponibilidade, aceleração de tráfego, VPN avançada e diagnóstico do kernel.",
    objectives: [
      "Executar actualizações e migrações de gestão e gateways",
      "Implementar ClusterXL e alta disponibilidade",
      "Configurar aceleração com SecureXL e CoreXL",
      "Implementar VPN site a site avançada e acesso remoto",
      "Diagnosticar ao nível do kernel e da cadeia de inspecção",
    ],
    targetAudience: [
      "Administradores com CCSA e experiência em produção",
      "Engenheiros responsáveis por ambientes Check Point críticos",
    ],
    prerequisites: ["CCSA e experiência prática com gateways Check Point"],
    syllabus: [
      { title: "Actualizações e migração", topics: ["Estratégias de actualização", "Migração de gestão", "Reversão"] },
      { title: "Alta disponibilidade", topics: ["ClusterXL", "Sincronização de estado", "Failover e diagnóstico"] },
      { title: "Desempenho", topics: ["SecureXL", "CoreXL", "Multi-Queue", "Afinação"] },
      { title: "VPN avançada", topics: ["Comunidades VPN", "Acesso remoto", "Diagnóstico de IKE e IPsec"] },
      { title: "Diagnóstico avançado", topics: ["Cadeia de inspecção", "fw monitor", "Depuração do kernel", "Análise de desempenho"] },
    ],
    durationHours: 80,
    instructorName: null,
    coverImageUrl: null,
    status: "publicado",
    createdAt: NOW,
    updatedAt: NOW,
    editions: [
      {
        id: "22222222-2222-4222-8222-000000000009",
        courseId: "11111111-1111-4111-8111-000000000008",
        code: "CCSE-2027-01",
        modality: "presencial",
        location: "Luanda — Talatona",
        startDate: "2027-02-09",
        endDate: "2027-04-16",
        schedule: "Terça e quinta, 18h00–21h30",
        capacity: 12,
        confirmedCount: 12,
        reservedCount: 0,
        prices: precos(310000),
        status: "inscricoes_abertas",
      },
    ],
  },
];

export function getCourseBySlug(slug: string): CourseWithEditions | undefined {
  return COURSES.find((c) => c.slug === slug && c.status === "publicado");
}

export function getPublishedCourses(): CourseWithEditions[] {
  return COURSES.filter((c) => c.status === "publicado");
}
