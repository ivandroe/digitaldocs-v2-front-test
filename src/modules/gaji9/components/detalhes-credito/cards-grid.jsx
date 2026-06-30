import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
// components
import { noDados } from '@/components/Panel';
import GridItem from '@/components/GridItem';
import { DefaultAction } from '@/components/Actions';
//
import { CardBox, FieldRow } from '@/modules/gaji9/components/detalhes-credito/shared';
import { DetalhesBemFinanciado } from '@/sections/processo/info-credito/garantias/detalhes-garantia';

// ---------------------------------------------------------------------------------------------------------------------

function toSxValue(item) {
  const sx = { ...(item.sxValue || null) };
  if (item.bold) sx.fontWeight = 700;
  if (item.color) sx.color = item.color;
  if (item.noWrap) sx.wordBreak = 'normal';
  return Object.keys(sx).length ? sx : null;
}

function CardItem({ item }) {
  if (item?.isHeader) {
    return (
      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
        {item.title}
      </Typography>
    );
  }

  if (item?.custom) return item.custom;
  if (item?.bem) return <Bens bem={item} />;
  if (item?.empty) return noDados(item?.label);

  return <FieldRow label={`${item.title}:`} value={item.value} tooltip={item.tooltip} sxValue={toSxValue(item)} />;
}

// ---------------------------------------------------------------------------------------------------------------------

export default function CardsGrid({ cards = [] }) {
  return (
    <Grid container spacing={2} justifyContent="center">
      {cards.map((card, index) => (
        <GridItem key={card.id ?? index} sm={2} lg={4}>
          <CardBox title={card.titulo} sx={card.sx}>
            {card.dados.map((item, idx) => (
              <CardItem key={item.id ?? `${card.id ?? index}_${idx}`} item={item} />
            ))}
          </CardBox>
        </GridItem>
      ))}
    </Grid>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function Bens({ bem }) {
  const [item, setItem] = useState(null);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="body2">
          {bem?.label}
          <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
            {(bem.nip && ` - NIP: ${bem.nip}`) ||
              (bem.matricula && `: ${bem.matricula}`) ||
              (bem.nura && `: ${bem.nura}`) ||
              (bem.numero_fatura_proforma && ` - Proforma: ${bem.numero_fatura_proforma}`) ||
              (bem.numero_matriz && ` - Matriz: ${bem.numero_matriz || bem.numero_descricao_predial}`) ||
              ''}
          </Typography>
        </Typography>
        <DefaultAction small label="DETALHES" onClick={() => setItem({ modal: 'detail', ...bem })} />
      </Box>

      {item?.modal === 'detail' && <DetalhesBemFinanciado onClose={() => setItem(null)} dados={bem} />}
    </Box>
  );
}
