import type {
  PokeApiEvolutionLink,
  PokeApiPokemon,
} from './pokeapi.types';
import {
  extractIdFromUrl,
  flattenEvolutionChain,
  toPokemonDetail,
  toPokemonSummary,
} from './pokemon.mapper';

describe('extractIdFromUrl', () => {
  it('extracts the trailing id from a PokéAPI url', () => {
    expect(
      extractIdFromUrl('https://pokeapi.co/api/v2/pokemon-species/25/'),
    ).toBe(25);
  });

  it('extracts the id when there is no trailing slash', () => {
    expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/150')).toBe(150);
  });

  it('returns 0 when no id is present', () => {
    expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/')).toBe(0);
  });
});

describe('toPokemonSummary', () => {
  const raw: PokeApiPokemon = {
    id: 1,
    name: 'bulbasaur',
    sprites: { front_default: 'sprite.png' },
    types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
    abilities: [{ ability: { name: 'overgrow' } }],
  };

  it('maps id, name, sprite and types', () => {
    expect(toPokemonSummary(raw)).toEqual({
      id: 1,
      name: 'bulbasaur',
      sprite: 'sprite.png',
      types: ['grass', 'poison'],
    });
  });

  it('falls back to an empty sprite when front_default is null', () => {
    expect(toPokemonSummary({ ...raw, sprites: { front_default: null } }).sprite).toBe(
      '',
    );
  });
});

describe('toPokemonDetail', () => {
  it('adds abilities and the provided evolutions to the summary fields', () => {
    const raw: PokeApiPokemon = {
      id: 4,
      name: 'charmander',
      sprites: { front_default: 'char.png' },
      types: [{ type: { name: 'fire' } }],
      abilities: [{ ability: { name: 'blaze' } }, { ability: { name: 'solar-power' } }],
    };
    const evolutions = [{ id: 4, name: 'charmander', sprite: '' }];

    expect(toPokemonDetail(raw, evolutions)).toEqual({
      id: 4,
      name: 'charmander',
      sprite: 'char.png',
      types: ['fire'],
      abilities: ['blaze', 'solar-power'],
      evolutions,
    });
  });
});

describe('flattenEvolutionChain', () => {
  it('flattens a linear chain in order', () => {
    const chain: PokeApiEvolutionLink = {
      species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
      evolves_to: [
        {
          species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
          evolves_to: [
            {
              species: {
                name: 'venusaur',
                url: 'https://pokeapi.co/api/v2/pokemon-species/3/',
              },
              evolves_to: [],
            },
          ],
        },
      ],
    };

    expect(flattenEvolutionChain(chain).map((e) => e.id)).toEqual([1, 2, 3]);
  });

  it('includes every branch of a branching chain (e.g. Eevee)', () => {
    const chain: PokeApiEvolutionLink = {
      species: { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon-species/133/' },
      evolves_to: [
        {
          species: { name: 'vaporeon', url: 'https://pokeapi.co/api/v2/pokemon-species/134/' },
          evolves_to: [],
        },
        {
          species: { name: 'jolteon', url: 'https://pokeapi.co/api/v2/pokemon-species/135/' },
          evolves_to: [],
        },
      ],
    };

    expect(flattenEvolutionChain(chain).map((e) => e.id)).toEqual([133, 134, 135]);
  });

  it('deduplicates repeated species ids', () => {
    const duplicate: PokeApiEvolutionLink = {
      species: { name: 'pichu', url: 'https://pokeapi.co/api/v2/pokemon-species/172/' },
      evolves_to: [],
    };
    const chain: PokeApiEvolutionLink = {
      species: { name: 'pichu', url: 'https://pokeapi.co/api/v2/pokemon-species/172/' },
      evolves_to: [duplicate],
    };

    expect(flattenEvolutionChain(chain)).toHaveLength(1);
  });
});
