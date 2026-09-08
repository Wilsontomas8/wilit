import { chromium } from "playwright";

const BASE = "http://localhost:3222";
const ABERTA = "22222222-2222-4222-8222-000000000001"; // CCNA presencial, 9 vagas
const CHEIA = "22222222-2222-4222-8222-000000000009"; // CCSE, 12/12 ocupados

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 1280, height: 1100 } });
const p = await ctx.newPage();
const erros = [];
p.on("pageerror", (e) => erros.push(String(e)));

async function preencherParticular(page) {
  await page.fill("#nomeCompleto", "Wilson Tomás da Silva");
  await page.fill("#nif", "003456789LA042");
  await page.fill("#biNumero", "003456789LA042");
  await page.fill("#line", "Rua Amílcar Cabral, nº 42, 3.º andar");
  await page.fill("#city", "Belas");
  await page.fill("#telefone", "+244 923 456 789");
  await page.fill("#email", "wilson.teste@exemplo.ao");
  await page.check('input[type="checkbox"]');
}

// 1 — validação bloqueia submissão vazia
await p.goto(`${BASE}/pre-inscricao?edicao=${ABERTA}`, { waitUntil: "load" });
await p.click('button[type="submit"]');
await p.waitForTimeout(700);
const naMesmaPagina = p.url().includes("/pre-inscricao?");
const nErros = await p.locator('[role="alert"]').count();
console.log(`1. Submissão vazia bloqueada: ${naMesmaPagina} | mensagens de erro: ${nErros}`);

// 2 — telefone não angolano é recusado
await p.fill("#telefone", "812345678");
await p.click('button[type="submit"]');
await p.waitForTimeout(500);
const erroTel = await p.locator('text=/número angolano válido/i').count();
console.log(`2. Telefone inválido recusado: ${erroTel > 0}`);

// 3 — percurso completo de particular
await preencherParticular(p);
await p.screenshot({ path: "/tmp/form-preenchido.png", fullPage: true });
await p.click('button[type="submit"]');
await p.waitForURL("**/obrigado**", { timeout: 15000 });
const ref = await p.locator("text=/^PI-\\d{4}-\\d{4}$/").first().textContent();
console.log(`3. Submissão aceite, referência: ${ref}`);
await p.screenshot({ path: "/tmp/obrigado.png", fullPage: true });

// 4 — troca para empresa mostra campos fiscais diferentes
await p.goto(`${BASE}/pre-inscricao?edicao=${ABERTA}`, { waitUntil: "load" });
await p.click('text=A factura é emitida à empresa');
await p.waitForTimeout(400);
const temDesignacao = await p.locator("#designacaoSocial").count();
const temBI = await p.locator("#biNumero").count();
console.log(`4. Empresa: designação social=${temDesignacao === 1}, BI removido=${temBI === 0}`);
await p.screenshot({ path: "/tmp/form-empresa.png", fullPage: true });

// 5 — turma cheia entra em lista de espera
await p.goto(`${BASE}/pre-inscricao?edicao=${CHEIA}`, { waitUntil: "load" });
const tituloEspera = await p.locator("h1").first().textContent();
await preencherParticular(p);
await p.click('button[type="submit"]');
await p.waitForURL("**/obrigado**", { timeout: 15000 });
const tituloResp = await p.locator("h1").first().textContent();
console.log(`5. Turma cheia: título="${tituloEspera?.trim()}" -> "${tituloResp?.trim()}"`);
await p.screenshot({ path: "/tmp/lista-espera.png" });

// 6 — API recusa preço forjado pelo cliente
const r = await p.evaluate(async (id) => {
  const res = await fetch("/api/v1/pre-inscricoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      edicaoId: id,
      plano: "corporativo", // não disponível nesta edição
      modoPagamento: "integral",
      candidato: {
        tipo: "particular",
        nomeCompleto: "Teste Teste",
        nif: "003456789LA042",
        biNumero: "003456789LA042",
        morada: { line: "Rua de teste 1", city: "Luanda", provincia: "Luanda" },
        telefone: "923456789",
        email: "t@t.ao",
      },
      consentimento: true,
    }),
  });
  return { status: res.status, body: await res.json() };
}, ABERTA);
console.log(`6. Plano indisponível recusado: ${r.status} ${r.body.erro}`);

console.log(`\nErros de JavaScript na página: ${erros.length}`);
if (erros.length) console.log(erros.slice(0, 3).join("\n"));
await b.close();
