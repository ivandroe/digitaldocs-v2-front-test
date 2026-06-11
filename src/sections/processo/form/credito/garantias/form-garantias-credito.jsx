import { useEffect, useMemo } from 'react';
// form
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
// utils
import { vdt } from '@/utils/formatObject';
import { useSelector, useDispatch } from '@/redux/store';
import { createItem, updateItem } from '@/redux/slices/digitaldocs';
//
import { shapeGarantia } from './validationFields';
import composeGarantiaPayload, { unpackGarantiaMetadados } from './composePayload';
import { construirSchemaImovel } from './schemaFileds';
import { listaGarantias } from '@/modules/gaji9/utils/applySortFilter';
// components
import GridItem from '@/components/GridItem';
import { DialogButons } from '@/components/Actions';
import { DialogTitleAlt } from '@/components/CustomDialog';
import { FormProvider, RHFSwitch, RHFNumberField, RHFAutocompleteObj } from '@/components/hook-form';
//
import FormContas from './form-contas';
import FormImoveis from './form-imoveis';
import FormTitulos from './form-titulos';
import FormVeiculos from './form-veiculos';
import FormSeguroBem from './form-seguro-bem';
import FormEntidades from './form-entidades';
import FormLivrancas from './form-livrancas';

const META_DEFAULTS = {
  conta: null,
  titulo: null,
  seguro: null,
  predio: null,
  terreno: null,
  veiculo: null,
  apartamento: null,
  fiadores: [],
  livrancas: [],
};

const CHAVE_TO_FIELD = {
  predios: 'predio',
  terrenos: 'terreno',
  apartamentos: 'apartamento',
  veiculos: 'veiculo',
};

// ---------------------------------------------------------------------------------------------------------------------

export default function FormGarantias({ dados, processoId, onClose }) {
  const dispatch = useDispatch();
  const { tiposGarantias, tiposSeguros } = useSelector((state) => state.gaji9);
  const { isSaving } = useSelector((state) => state.digitaldocs);

  const isEdit = dados?.modal === 'update';
  const garantiasList = useMemo(() => listaGarantias(tiposGarantias), [tiposGarantias]);
  const tipoGarantia = useMemo(
    () => garantiasList?.find(({ id }) => id === dados?.tipo_garantia_id) || null,
    [dados?.tipo_garantia_id, garantiasList]
  );

  const formSchema = shapeGarantia();
  const chaveInicial = useMemo(() => {
    const subtipo = tipoGarantia?.subtipos?.find(({ id }) => id === dados?.subtipo_garantia_id);
    return subtipo?.chave_meta ?? tipoGarantia?.chave_meta ?? null;
  }, [tipoGarantia, dados?.subtipo_garantia_id]);

  const bensFinanciadosCredito =
    useSelector((state) => state.digitaldocs.processo?.credito?.gaji9_metadados?.bens_financiados) || [];

  const defaultValues = useMemo(() => {
    const grupos = unpackGarantiaMetadados(dados?.metadados, chaveInicial);
    const bemUnico = grupos.predio ?? grupos.terreno ?? grupos.apartamento ?? grupos.veiculo;
    const tipoBemInicial = CHAVE_TO_FIELD[chaveInicial];
    const bemSelInicial =
      bemUnico?.bem_financiado && tipoBemInicial
        ? matchBemFinanciado(bemUnico, bensFinanciadosCredito, tipoBemInicial)
        : null;
    return {
      conta: grupos.conta,
      titulo: hidratarSegurosNested(grupos.titulo, tiposSeguros),
      seguro: normalizarSeguro(grupos.seguro, tiposSeguros),
      fiadores: grupos.fiadores,
      livrancas: grupos.livrancas,
      percentagem_cobertura: dados?.percentagem_cobertura || '',
      predio: construirSchemaImovel(grupos.predio, tiposSeguros),
      terreno: construirSchemaImovel(grupos.terreno, tiposSeguros),
      apartamento: construirSchemaImovel(grupos.apartamento, tiposSeguros),
      veiculo: grupos.veiculo
        ? hidratarSegurosNested(
            {
              ...grupos.veiculo,
              valor_avaliacao: grupos.veiculo?.valor_avaliacao ?? '',
              localizacao_conservatoria: grupos.veiculo?.localizacao_conservatoria ?? '',
              bem_financiado: Boolean(grupos.veiculo?.bem_financiado),
              bem_sem_registo: Boolean(grupos.veiculo?.bem_sem_registo),
              numero_fatura_proforma: grupos.veiculo?.numero_fatura_proforma ?? '',
              emissora_fatura_proforma: grupos.veiculo?.emissora_fatura_proforma ?? '',
              data_emissao_fatura_proforma: grupos.veiculo?.data_emissao_fatura_proforma ?? null,
            },
            tiposSeguros
          )
        : null,
      bem_financiado: Boolean(bemUnico?.bem_financiado),
      _bemSelecionado: bemSelInicial,
      subtipo_garantia: tipoGarantia?.subtipos?.find(({ id }) => id === dados?.subtipo_garantia_id) || null,
      tipo_garantia: tipoGarantia,
    };
  }, [dados, tipoGarantia, chaveInicial, bensFinanciadosCredito, tiposSeguros]);

  const methods = useForm({ resolver: yupResolver(formSchema), defaultValues });
  const { handleSubmit, watch, control, reset, setValue, getValues } = methods;

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados]);

  const tipo = watch('tipo_garantia');
  const subtipo = watch('subtipo_garantia');
  const bemFinanciado = useWatch({ control, name: 'bem_financiado' });
  const subtipos = useMemo(() => tipo?.subtipos ?? [], [tipo?.subtipos]);
  const chaveMeta = useMemo(() => extrairChaveMeta(tipo, subtipo) ?? null, [tipo, subtipo]);
  const campoBem = chaveMeta ? CHAVE_TO_FIELD[chaveMeta] : null;

  const bensOptions = useMemo(() => {
    if (!campoBem) return [];
    return bensFinanciadosCredito
      .filter((b) => b?.tipo === campoBem)
      .map((b, i) => ({ ...b, id: i, label: descreverBemOption(b) }));
  }, [campoBem, bensFinanciadosCredito]);

  // Propaga flag top-level → flag do bem; limpa o picker quando desactiva
  useEffect(() => {
    if (!bemFinanciado) setValue('_bemSelecionado', null, vdt);
    if (!campoBem) return;
    const bemActual = getValues(campoBem);
    if (!bemActual) return;
    setValue(`${campoBem}.bem_financiado`, Boolean(bemFinanciado), vdt);
    // sem bem financiado não há "sem registo" — evita exigir fatura proforma indevidamente
    if (!bemFinanciado) setValue(`${campoBem}.bem_sem_registo`, false, vdt);
  }, [bemFinanciado, campoBem, getValues, setValue]);

  // Preenche apenas o identificador do bem com base na selecção do dropdown
  // Imóveis: usa NIP se existir, caso contrário Nº matriz (+ Nº descrição predial)
  // Veículos: usa matrícula se existir, caso contrário NURA
  const preencherIdentificador = (bem) => {
    if (!bem || !campoBem) return;
    const atual = getValues(campoBem) || {};
    const semRegisto = Boolean(bem?.bem_sem_registo);
    const proximos = { ...atual, bem_financiado: true, bem_sem_registo: semRegisto };

    if (campoBem === 'veiculo') {
      if (semRegisto) {
        // sem registo: identifica-se pela fatura proforma (não há matrícula/NURA)
        proximos.numero_fatura_proforma = bem?.numero_fatura_proforma ?? '';
        proximos.emissora_fatura_proforma = bem?.emissora_fatura_proforma ?? '';
        proximos.data_emissao_fatura_proforma = bem?.data_emissao_fatura_proforma ?? null;
      } else if (bem?.matricula) {
        proximos.matricula = bem.matricula;
      } else if (bem?.nura) {
        proximos.nura = bem.nura;
      }
    } else if (bem?.nip) {
      proximos.nip = bem.nip;
    } else if (bem?.numero_matriz) {
      proximos.numero_matriz = bem.numero_matriz;
      if (bem?.numero_descricao_predial) proximos.numero_descricao_predial = bem.numero_descricao_predial;
    }

    setValue(campoBem, proximos, vdt);
  };

  const onSubmit = async (values) => {
    const msg = isEdit ? 'Garantia atualizada' : 'Garantia adicionada';
    const params = { id: dados?.id || '', fillCredito: true, processoId, msg, put: true };
    const formData = isEdit ? composeGarantiaPayload(values, chaveMeta) : [composeGarantiaPayload(values, chaveMeta)];
    dispatch((isEdit ? updateItem : createItem)('garantias', JSON.stringify(formData), { ...params, onClose }));
  };

  const resetMetaFields = () => {
    Object.entries(META_DEFAULTS).forEach(([key, val]) => {
      setValue(key, val, vdt);
    });
    setValue('bem_financiado', false, vdt);
    setValue('_bemSelecionado', null, vdt);
  };

  return (
    <Dialog open fullWidth maxWidth="lg">
      <DialogTitleAlt title={isEdit ? 'Editar garantia' : 'Adicionar garantia'} onClose={onClose} sx={{ pb: 2 }} />
      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} sx={{ flexGrow: 1, pt: 1 }}>
            <GridItem md={subtipos.length > 0 ? 5 : 9}>
              <RHFAutocompleteObj
                dc
                label="Garantia"
                disabled={isEdit}
                options={garantiasList}
                name="tipo_garantia"
                onChange={(_, newValue) => {
                  setValue('tipo_garantia', newValue, vdt);
                  setValue('subtipo_garantia', null, vdt);
                  resetMetaFields();
                }}
              />
            </GridItem>

            {subtipos.length > 0 ? (
              <GridItem sm={8} md={4}>
                <RHFAutocompleteObj
                  dc
                  label="Subtipo"
                  disabled={isEdit}
                  options={subtipos}
                  name="subtipo_garantia"
                  onChange={(_, newValue) => {
                    setValue('subtipo_garantia', newValue, vdt);
                    resetMetaFields();
                  }}
                />
              </GridItem>
            ) : null}
            <GridItem sm={4} md={3}>
              <RHFNumberField label="Cobertura" name="percentagem_cobertura" tipo="%" />
            </GridItem>
            {campoBem && (
              <>
                <GridItem sm={bemFinanciado && bensOptions.length > 0 ? 4 : 12}>
                  <RHFSwitch name="bem_financiado" label="Bem financiado pelo crédito" mt />
                </GridItem>
                {bemFinanciado && bensOptions.length > 0 && (
                  <GridItem sm={8}>
                    <RHFAutocompleteObj
                      label="Bem do crédito"
                      name="_bemSelecionado"
                      options={bensOptions}
                      onChange={(_, newValue) => {
                        setValue('_bemSelecionado', newValue, vdt);
                        preencherIdentificador(newValue);
                      }}
                    />
                  </GridItem>
                )}
              </>
            )}
            {chaveMeta === 'fiadores' && <GridItem children={<FormEntidades label="Fiador" name="fiadores" />} />}
            {chaveMeta === 'livrancas' && <GridItem children={<FormLivrancas />} />}
            {chaveMeta === 'contas' && <GridItem children={<FormContas />} />}
            {chaveMeta === 'seguros' && <GridItem children={<FormSeguroBem />} />}
            {chaveMeta === 'titulos' && <GridItem children={<FormTitulos />} />}
            {chaveMeta === 'terrenos' && <GridItem children={<FormImoveis tipo="Terreno" name="terreno" />} />}
            {chaveMeta === 'predios' && <GridItem children={<FormImoveis tipo="Prédio" name="predio" />} />}
            {chaveMeta === 'apartamentos' && (
              <GridItem children={<FormImoveis tipo="Apartamento" name="apartamento" />} />
            )}
            {chaveMeta === 'veiculos' && <GridItem children={<FormVeiculos />} />}
          </Grid>
          <DialogButons onClose={onClose} isSaving={isSaving} edit={isEdit} />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------------------------------------------------

function matchBemFinanciado(bem, lista, tipoBem) {
  if (!bem || !Array.isArray(lista) || !lista.length) return null;
  const candidatos = lista.filter((b) => b?.tipo === tipoBem);
  const idx = candidatos.findIndex((bf) => {
    if (tipoBem === 'veiculo') {
      return (
        (bem.matricula && bf.matricula && bem.matricula === bf.matricula) ||
        (bem.nura && bf.nura && bem.nura === bf.nura) ||
        (bem.numero_fatura_proforma &&
          bf.numero_fatura_proforma &&
          bem.numero_fatura_proforma === bf.numero_fatura_proforma)
      );
    }
    return (
      (bem.nip && bf.nip && bem.nip === bf.nip) ||
      (bem.numero_descricao_predial && bf.numero_descricao_predial && bem.numero_descricao_predial === bf.numero_descricao_predial) ||
      (bem.numero_matriz && bf.numero_matriz && bem.numero_matriz === bf.numero_matriz)
    );
  });
  if (idx < 0) return null;
  const escolhido = candidatos[idx];
  return { ...escolhido, id: idx, label: descreverBemOption(escolhido) };
}

function labelTipoSeguro(tipoId, label, tiposSeguros) {
  if (label) return label;
  const found = (tiposSeguros ?? []).find((t) => t?.id === tipoId);
  return found?.designacao ?? '';
}

function normalizarSeguro(seguro, tiposSeguros) {
  if (!seguro) return null;
  if (seguro?.tipo && seguro.tipo.id) {
    return { ...seguro, tipo: { ...seguro.tipo, label: seguro.tipo.label || labelTipoSeguro(seguro.tipo.id, '', tiposSeguros) } };
  }
  if (seguro?.tipo_seguro_id) {
    return {
      ...seguro,
      tipo: { id: seguro.tipo_seguro_id, label: labelTipoSeguro(seguro.tipo_seguro_id, seguro.tipo_seguro, tiposSeguros) },
    };
  }
  return seguro;
}

function hidratarSegurosNested(bem, tiposSeguros) {
  if (!bem || !Array.isArray(bem?.seguros)) return bem;
  return {
    ...bem,
    seguros: bem.seguros.map((s) => normalizarSeguro(s, tiposSeguros)),
  };
}

function descreverBemOption(bem) {
  if (bem?.tipo === 'veiculo') {
    const id =
      bem?.matricula ||
      [bem?.marca, bem?.modelo].filter(Boolean).join(' ') ||
      (bem?.numero_fatura_proforma ? `Proforma ${bem.numero_fatura_proforma}` : '');
    return id || 'Veículo sem identificador';
  }
  const partes = [];
  if (bem?.nip) partes.push(`NIP ${bem.nip}`);
  else if (bem?.numero_matriz) partes.push(`Mtz ${bem.numero_matriz}`);
  if (bem?.identificacao_fracao) partes.push(`Frac. ${bem.identificacao_fracao}`);
  if (bem?.freguesia) partes.push(bem.freguesia);
  return partes.length ? partes.join(' · ') : 'Bem sem identificador';
}

function extrairChaveMeta(tipoSelecionado, subtipoSelecionado) {
  if (!tipoSelecionado) return null;
  if (!Array.isArray(tipoSelecionado?.subtipos) || tipoSelecionado?.subtipos?.length === 0) {
    return tipoSelecionado?.chave_meta ?? null;
  }
  if (!subtipoSelecionado) return null;
  return subtipoSelecionado?.chave_meta ?? tipoSelecionado?.chave_meta ?? null;
}
