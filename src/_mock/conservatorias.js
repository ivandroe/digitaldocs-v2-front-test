const CONSERVATORIAS_POR_ILHA = {
  'Santo Antão': ['Porto Novo', 'Paul'],
  'São Vicente': ['São Vicente'],
  'São Nicolau': ['São Nicolau'],
  Sal: ['Espargos', 'Santa Maria'],
  'Boa Vista': ['Boa Vista'],
  Maio: ['Maio'],
  Santiago: [
    'Ribeira Grande de Santiago',
    'Assomada',
    'São Domingos',
    'São Lourenço dos Órgãos',
    'São Salvador do Mundo',
    'São Miguel',
    'Tarrafal',
    'Praia',
  ],
  Fogo: ['São Filipe', 'Mosteiros', 'Santa Catarina'],
  Brava: ['Brava'],
};

export const listaConservatorias = Object.values(CONSERVATORIAS_POR_ILHA).flat().sort();
