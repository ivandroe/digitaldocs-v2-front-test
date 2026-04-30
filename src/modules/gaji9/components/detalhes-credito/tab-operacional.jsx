// @mui
import Grid from '@mui/material/Grid';
// utils
import { ptDateTime } from '@/utils/formatTime';
//
import GridItem from '@/components/GridItem';
import { CardBox, FieldRow, StatusBadge, SchemaBadge } from './shared';

// ---------------------------------------------------------------------------------------------------------------------

export function TabOperacional({ credito }) {
  return (
    <Grid container spacing={2}>
      <GridItem md={6}>
        <CardBox title="Cliente">
          <FieldRow label="Nº cliente" value={credito.cliente} />
          <FieldRow label="Morada" value={credito.morada_cliente} />
          <FieldRow label="Email" value={credito.morada_eletronico_cliente} />
        </CardBox>
      </GridItem>

      <GridItem md={6}>
        <CardBox title="Conta e balcão">
          <FieldRow label="Balcão domicílio" value={credito.balcao_domicilio} />
          <FieldRow label="Conta DO" value={credito.conta_do} />
          <FieldRow label="Conta DO renda" value={credito.conta_do_renda} />
        </CardBox>
      </GridItem>

      <GridItem md={6}>
        <CardBox title="Metadados do registo">
          <FieldRow
            label="Aplicação origem"
            value={
              <StatusBadge
                label={credito.aplicacao_origem}
                variant={credito.aplicacao_origem === 'DDOCS' ? '' : 'info'}
              />
            }
          />
          <FieldRow
            label="Processo origem ID"
            value={credito.processo_origem_id}
            tooltip="ID do processo DDOCS que originou este crédito"
          />
          <FieldRow
            label="Versão schema"
            value={<SchemaBadge version={credito.versao_schema} />}
            tooltip="1 = legacy, 2 = crédito DDOCS com info_extra_v2"
          />
          <FieldRow
            label="Versão registo"
            value={credito.versao}
            tooltip="Versão interna do registo para histórico de alterações"
          />
          <FieldRow
            label="Ativo"
            value={
              <StatusBadge label={credito.ativo ? 'Sim' : 'Não'} variant={credito.ativo ? 'active' : 'inactive'} />
            }
          />
        </CardBox>
      </GridItem>

      <GridItem md={6}>
        <CardBox title="Auditoria">
          <FieldRow label="Criado em" value={ptDateTime(credito.criado_em)} />
          <FieldRow label="Criado por" value={credito.criado_por} />
          <FieldRow label="Modificado em" value={ptDateTime(credito.modificado_em)} />
          <FieldRow label="Modificado por" value={credito.modificado_por} />
        </CardBox>
      </GridItem>
    </Grid>
  );
}
