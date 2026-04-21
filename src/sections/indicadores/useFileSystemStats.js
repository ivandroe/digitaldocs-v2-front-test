import { useMemo } from 'react';

// ---------------------------------------------------------------------------------------------------------------------

const FILE_TYPES = [
  { key: 'total', tipo: 'Total', file: 'folder', match: () => true },
  { key: 'pdf', tipo: 'Pdf', file: 'format_pdf', match: (t) => t === 'application/pdf' },
  { key: 'imagem', tipo: 'Img', file: 'format_image', match: (t) => t.startsWith('image/') },
  {
    key: 'excel',
    tipo: 'Excel',
    file: 'format_excel',
    match: (t) => t === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || t.includes('excel'),
  },
  {
    key: 'word',
    tipo: 'Word',
    file: 'format_word',
    match: (t) =>
      t === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || t.includes('msword'),
  },
  { key: 'outros', tipo: 'Outros', file: 'file', match: null }, // fallback
];

// ---------------------------------------------------------------------------------------------------------------------

export function useFileSystemStats(fileSystem = []) {
  return useMemo(() => {
    const stats = Object.fromEntries(FILE_TYPES.map(({ key }) => [key, { qnt: 0, tamanho: 0 }]));

    fileSystem.forEach(({ tipo, quantidade, tamanhoMB }) => {
      const bytes = tamanhoMB * 1_000_000;
      stats.total.qnt += quantidade;
      stats.total.tamanho += bytes;

      const matched = FILE_TYPES.slice(1, -1).find(({ match }) => match(tipo));
      const target = matched ? stats[matched.key] : stats.outros;
      target.qnt += quantidade;
      target.tamanho += bytes;
    });

    return FILE_TYPES.map(({ key, tipo, file }) => ({ tipo, file, ...stats[key] }));
  }, [fileSystem]);
}
