// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
// utils
import { ptDate } from '@/utils/formatTime';
import { labelMeses } from '@/utils/formatText';
import { fCurrency, fPercent } from '@/utils/formatNumber';
//
import { noDados } from '@/components/Panel';
import GridItem from '@/components/GridItem';
import { CardBox, FieldRow, StatusBadge } from './shared';

// ---------------------------------------------------------------------------------------------------------------------

export function TabFinanceiro({ credito }) {
  const isV2 = credito.versao_schema === 2;
  const { info_extra_v2: extra = null } = credito || {};

  return (
    <Box>
      <Grid container spacing={2} justifyContent="center">
        {/* Taxas */}
        <GridItem md={6} lg={4}>
          <CardBox title="Taxas">
            <FieldRow
              label="Taxa juro precário"
              tooltip="Taxa base constante no precário"
              value={fPercent(credito.taxa_juro_precario)}
            />
            <FieldRow label="Desconto" value={fPercent(credito.taxa_juro_desconto)} />
            <FieldRow
              label="Taxa negociada"
              sxValue={{ color: 'success.main' }}
              value={fPercent(credito.taxa_juro_negociado)}
            />
            <FieldRow
              label="TAEG"
              tooltip="Taxa Anual Efetiva Global"
              sxValue={{ color: 'warning.main' }}
              value={fPercent(credito.taxa_taeg)}
            />
            <FieldRow label="Imposto de selo" value={fPercent(credito.taxa_imposto_selo)} />
            <FieldRow label="Comissão abertura" value={fPercent(credito.taxa_comissao_abertura)} />
            <FieldRow
              label="Isento comissão"
              value={
                <StatusBadge
                  label={credito.isento_comissao ? 'Sim' : 'Não'}
                  variant={credito.isento_comissao ? 'active' : ''}
                />
              }
            />
          </CardBox>
        </GridItem>

        {/* Prestação */}
        <GridItem md={6} lg={4}>
          <CardBox title="Prestação">
            <FieldRow label="N.º prestações" value={labelMeses(credito.numero_prestacao)} />
            <FieldRow
              label="Valor prestação"
              sxValue={{ color: 'success.main' }}
              value={fCurrency(credito.valor_prestacao)}
            />
            <FieldRow
              label="Valor s/ desconto"
              tooltip="Prestação sem desconto de taxa"
              value={fCurrency(credito.valor_prestacao_sem_desconto)}
            />
            <FieldRow label="Data 1.ª prestação" value={ptDate(credito.data_vencimento_prestacao1)} />
            <FieldRow label="Meses vencimento" value={credito.meses_vencimento} />
          </CardBox>
        </GridItem>

        {/* Encargos */}
        <GridItem md={6} lg={4}>
          <CardBox title="Encargos">
            <FieldRow label="Custo total" sxValue={{ color: 'warning.main' }} value={fCurrency(credito.custo_total)} />
            <FieldRow label="Valor de juro" value={fCurrency(credito.valor_juro)} />
            <FieldRow label="Imposto de selo" value={fCurrency(credito.valor_imposto_selo)} />
            <FieldRow label="Comissão" value={fCurrency(credito.valor_comissao)} />
            <FieldRow label="Prémio seguro" value={fCurrency(credito.valor_premio_seguro)} />
          </CardBox>
        </GridItem>

        {/* Produto */}
        <GridItem md={6} lg={4}>
          <CardBox title="Produto">
            <FieldRow label="Componente" value={credito.rotulo || credito.componente} />
            <FieldRow label="Segmento" value={credito.segmento} />
            <FieldRow
              label="Tipo titular"
              value={`${credito.tipo_titular}${credito.consumidor ? ' - Consumidor' : ''}`}
            />
            <FieldRow label="Prazo contratual" value={labelMeses(credito.prazo_contratual)} />
          </CardBox>
        </GridItem>

        {/* Finalidade */}
        <GridItem md={6} lg={4}>
          <CardBox title="Finalidade">
            <Typography variant="body2">{credito.finalidade || noDados('(Não definido...)')}</Typography>
          </CardBox>
        </GridItem>

        {isV2 && extra && (
          <GridItem md={6} lg={4}>
            <CardBox title="Info. adicionais" sx={{ borderColor: 'rgba(55,138,221,.2)' }}>
              <FieldRow
                label="Taxa equivalente"
                value={
                  <StatusBadge
                    label={credito.modo_taxa_equivalente ? 'Sim' : 'Não'}
                    variant={credito.modo_taxa_equivalente ? 'active' : ''}
                  />
                }
              />
              <FieldRow label="Taxa mora" value={fPercent(extra.taxa_mora)} sxValue={{ color: 'error.main' }} />
              <FieldRow label="Imp. selo utilização" value={fPercent(extra.taxa_imposto_selo_utilizacao)} />
              <FieldRow label="Comissão imobilização" value={fPercent(extra.taxa_comissao_imobilizacao)} />
              <FieldRow label="Período carência" value={extra.periodo_carencia} />
              <FieldRow label="Prazo utilização" value={labelMeses(credito.prazo_utilizacao)} />
            </CardBox>
          </GridItem>
        )}
      </Grid>
    </Box>
  );
}
