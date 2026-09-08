/**
 * Contratos de dados — WP-A.03 do SoW v2.1.
 *
 * Este pacote é a fronteira entre interface e servidor. Os schemas aqui
 * definidos são validados nos dois lados: no cliente para dar erros úteis,
 * no servidor porque é lá que a validação conta.
 */
export * from "./plans";
export * from "./course";
export * from "./pre-enrollment";
