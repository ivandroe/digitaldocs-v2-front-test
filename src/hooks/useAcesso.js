import { useSelector } from '../redux/store';

// ---------------------------------------------------------------------------------------------------------------------

export function usePermissao() {
  const { mail } = useSelector((state) => state.intranet);
  const { adminGaji9, utilizador } = useSelector((state) => state.gaji9);

  const isAdmin = adminGaji9 || false;
  const isGerente = utilizador?._role === 'GERENTE' || false;
  // Ramo estrito (has_role_externo): ADMIN ou ROOT, sem fallback de grant
  const isAdminRoot = adminGaji9 || ['ADMIN', 'ROOT'].includes(utilizador?._role) || false;
  const emailUtilizador = (utilizador?.email || utilizador?.utilizador_email || mail || '').toLowerCase();

  function temAcesso(acessos, permissoes) {
    if (!Array.isArray(acessos) || acessos.length === 0) return false;
    return permissoes.some((p) => acessos.includes(p));
  }

  function temPermissao(permissoes) {
    return adminGaji9 || temAcesso(utilizador?.acessos, permissoes) || false;
  }

  // Espelha ContratoService.deleteContratoCredito (gaji9 V2):
  //   não entregue  -> criador pode sempre; não-criador requer CONTRATO:DELETE
  //   já entregue    -> role estrito ADMIN/ROOT (grant DELETE não basta)
  function podeAnularContrato(contrato) {
    if (!contrato) return false;
    if (contrato?.data_entrega) return isAdminRoot;
    if (emailUtilizador && contrato?.criador?.toLowerCase() === emailUtilizador) return true;
    return temPermissao(['DELETE_CONTRATO']);
  }

  return { temPermissao, podeAnularContrato, utilizador, isAdmin, isAdminRoot, isGerente };
}

// ---------------------------------------------------------------------------------------------------------------------

export function useAcesso({ acessos }) {
  const { meusacessos } = useSelector((state) => state.parametrizacao);
  return !!meusacessos?.find((row) => acessos?.includes(row));
}
