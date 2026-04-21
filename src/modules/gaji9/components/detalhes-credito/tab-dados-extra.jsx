// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
//
import { ptDate } from '@/utils/formatTime';
import { labelMeses } from '@/utils/formatText';
import { fPercent, fCurrency } from '@/utils/formatNumber';
//
import GridItem from '@/components/GridItem';
import { CardBox, FieldRow, StatusBadge } from './shared';

// ---------------------------------------------------------------------------------------------------------------------

export function TabDadosExtra({ info }) {
  return (
    <Box>
      <Grid container spacing={2}>
        <GridItem md={6} lg={4}>
          <CardBox title="Taxas adicionais">
            <FieldRow
              label="Taxa mora"
              value={fPercent(info.taxa_mora)}
              tooltip="Taxa aplicada em caso de incumprimento"
            />
            <FieldRow
              label="Imp. selo utilização"
              tooltip="Imposto de selo na utilização do crédito"
              value={fPercent(info.taxa_imposto_selo_utilizacao)}
            />
            <FieldRow
              label="Comissão imobilização"
              value={fPercent(info.taxa_comissao_imobilizacao)}
              tooltip="Comissão sobre montante imobilizado não utilizado"
            />
            <FieldRow
              label="Taxa equivalente"
              value={
                <StatusBadge
                  label={info.modo_taxa_equivalente ? 'Sim' : 'Não'}
                  variant={info.modo_taxa_equivalente ? 'active' : ''}
                />
              }
            />
          </CardBox>
        </GridItem>

        {info.tem_isencao_imposto_selo && (
          <GridItem md={6} lg={4}>
            <CardBox title="Isenções">
              <FieldRow
                label="Isenção imp. selo"
                value={
                  <StatusBadge
                    label={info.tem_isencao_imposto_selo ? 'Sim' : 'Não'}
                    variant={info.tem_isencao_imposto_selo ? 'active' : ''}
                  />
                }
              />
              <FieldRow
                label="Cap. máx. isento IS"
                value={fCurrency(info.capital_max_isento_imposto_selo)}
                tooltip="Montante máximo sobre o qual se aplica isenção de imposto de selo"
              />
            </CardBox>
          </GridItem>
        )}

        <GridItem md={6} lg={4}>
          <CardBox title="Utilização">
            <FieldRow label="Período carência" value={labelMeses(info.periodo_carencia)} />
            <FieldRow label="Prazo utilização" value={labelMeses(info.prazo_utilizacao)} />
            <FieldRow label="Data utilização" value={ptDate(info.data_utilizacao)} />
            <FieldRow
              label="Revolving"
              value={<StatusBadge label={info.revolving ? 'Sim' : 'Não'} variant={info.revolving ? 'warn' : ''} />}
              tooltip="Capital reembolsado volta a ficar disponível"
            />
          </CardBox>
        </GridItem>

        <GridItem md={6} lg={4}>
          <CardBox title="Benefícios e condições especiais">
            <FieldRow
              label="Bonificado"
              value={<StatusBadge label={info.bonificado ? 'Sim' : 'Não'} variant={info.bonificado ? 'active' : ''} />}
            />
            <FieldRow
              label="Jovem bonificado"
              value={
                <StatusBadge
                  label={info.jovem_bonificado ? 'Sim' : 'Não'}
                  variant={info.jovem_bonificado ? 'active' : ''}
                />
              }
            />
            <FieldRow
              label="Colaborador empresa parceira"
              value={
                <StatusBadge
                  label={info.colaborador_empresa_parceira ? 'Sim' : 'Não'}
                  variant={info.colaborador_empresa_parceira ? 'active' : ''}
                />
              }
            />
          </CardBox>
        </GridItem>

        <GridItem md={6} lg={4}>
          <CardBox title="Crédito habitação">
            <FieldRow
              label="1ª habitação própria"
              value={
                <StatusBadge
                  label={info.habitacao_propria_1 ? 'Sim' : 'Não'}
                  variant={info.habitacao_propria_1 ? 'active' : ''}
                />
              }
            />
            <FieldRow label="Tipo imóvel ID" value={info.tipo_imovel_id} />
            <FieldRow label="Finalidade CH" value={info.finalidade_credito_habitacao} />
            <FieldRow label="Bem / serviço financiado" value={info.bem_servico_financiado} />
          </CardBox>
        </GridItem>

        <GridItem md={6} lg={4}>
          <CardBox title="Vendedor / Fornecedor">
            <FieldRow
              label="NIB vendedor"
              value={info.nib_vendedor_ou_fornecedor}
              tooltip="NIB da conta do vendedor ou fornecedor do bem financiado"
            />
            <FieldRow label="Nome empresa fornecedora" value={info.nome_empresa_fornecedora} />
            <FieldRow
              label="Instituição crédito conta vendedor"
              value={info.instituicao_credito_conta_vendedor_ou_fornecedor}
            />
            <FieldRow
              label="Valor a transferir"
              value={info.valor_transferir_conta_vendedor_ou_fornecedor}
              tooltip="Montante a transferir para conta do vendedor na contratação"
            />
          </CardBox>
        </GridItem>

        <GridItem md={6} lg={4}>
          <CardBox title="Formação (crédito educação)">
            <FieldRow
              label="Montante tranches CrediBoisa"
              value={info.montante_tranches_credibolsa}
              tooltip="Montante por tranche em créditos de aquisição de títulos"
            />
            <FieldRow label="Designação curso" value={info.designacao_curso} />
            <FieldRow label="Nível formação" value={info.nivel_formacao} />
            <FieldRow label="Estabelecimento ensino" value={info.estabelecimento_ensino} />
            <FieldRow label="Localização estabelecimento" value={info.localizacao_estabelecimento_ensino} />
          </CardBox>
        </GridItem>
      </Grid>
    </Box>
  );
}
