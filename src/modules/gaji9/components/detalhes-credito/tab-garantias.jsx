import { useState } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
// utils
import { fCurrency, fPercent } from '@/utils/formatNumber';
// components
import { DefaultAction } from '@/components/Actions';
import { TableSearchNotFound } from '@/components/table';
import { noDados, CellChecked } from '@/components/Panel';
import DetalhesGarantia from '@/sections/processo/info-credito/garantias/detalhes-garantia';

// ---------------------------------------------------------------------------------------------------------------------

export function TableGarantias({ dados, openForm }) {
  const [item, setItem] = useState(null);
  const notFound = dados?.length === 0;

  return (
    <Card sx={{ p: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Garantia</TableCell>
            <TableCell align="center">Tipo</TableCell>
            <TableCell align="right">Cobertura</TableCell>
            <TableCell align="right">Valor</TableCell>
            <TableCell align="center">Ativo</TableCell>
            <TableCell width={10}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dados?.map((row, index) => (
            <TableRow hover key={`${row?.id}_${index}`}>
              <TableCell>
                {row?.tipo_garantia}
                {row?.subtipo_garantia ? ` - ${row?.subtipo_garantia}` : ''}
                {!row?.tipo_garantia && !row?.subtipo_garantia ? noDados('(Não definido...)') : ''}
              </TableCell>
              <TableCell align="center">{row?.reais ? 'Real' : 'Pessoal'}</TableCell>
              <TableCell align="right">
                {fPercent(row?.percentagem_cobertura) || noDados('(Não definido...)')}
              </TableCell>
              <TableCell align="right">{fCurrency(row?.valor_garantia || row?.valor)}</TableCell>
              <CellChecked check={row?.ativo} />
              <TableCell>
                <DefaultAction small label="DETALHES" onClick={() => setItem({ modal: 'detail', ...row })} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {notFound && <TableSearchNotFound message="Nenhuma registo encontrado..." height={130} />}
      </Table>

      {item?.modal === 'detail' && <DetalhesGarantia onClose={() => setItem(null)} dados={item} openForm={openForm} />}
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

export function normalizarGarantias(inputGarantias = []) {
  if (!Array.isArray(inputGarantias)) return [];

  return inputGarantias.map((g) => {
    const metadados = g?.info_extra_v2?.metadados || {};
    const bem = metadados?.bem || {};
    const garantidores = metadados?.garantidores || [];

    return {
      // Mapeamento principal
      valor_garantia: g.valor ?? null,
      tipo_garantia_id: g.tipo_id ?? null,
      subtipo_garantia_id: g.subtipo_id ?? null,
      percentagem_cobertura: g.percentagem_cobertura ?? null,

      // Metadados normalizados
      metadados: {
        bem,
        numero_livranca: metadados.numero_livranca ?? null,
        garantidores: Array.isArray(garantidores) ? garantidores : [],
      },

      // Campos adicionais do sistema atual
      id: g.id ?? null,
      reais: g.reais ?? null,
      tipo_garantia: g.tipo ?? null,
      subtipo_garantia: g.subtipo ?? null,

      ativo: g.ativo ?? true,
      criador: g.feito_por ?? null,
      criado_em: g.criado_em ?? null,
      modificador: g.modificador ?? null,
      modificado_em: g.ultima_modificacao ?? null,
    };
  });
}
