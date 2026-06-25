import type {
  PokeApiEvolutionLink,
  PokeApiPokemon,
} from './pokeapi.types';
import type {
  EvolutionOption,
  PokemonDetail,
  PokemonSummary,
} from './pokemon.types';

export function extractIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? parseInt(match[1], 10) : 0;
}

export function toPokemonSummary(raw: PokeApiPokemon): PokemonSummary {
  return {
    id: raw.id,
    name: raw.name,
    sprite: raw.sprites.front_default ?? '',
    types: raw.types.map((t) => t.type.name),
  };
}

export function toPokemonDetail(
  raw: PokeApiPokemon,
  evolutions: EvolutionOption[],
): PokemonDetail {
  return {
    id: raw.id,
    name: raw.name,
    sprite: raw.sprites.front_default ?? '',
    types: raw.types.map((t) => t.type.name),
    abilities: raw.abilities.map((a) => a.ability.name),
    evolutions,
  };
}

export function flattenEvolutionChain(
  link: PokeApiEvolutionLink,
): EvolutionOption[] {
  const results: EvolutionOption[] = [];
  const seen = new Set<number>();

  function walk(node: PokeApiEvolutionLink) {
    const id = extractIdFromUrl(node.species.url);
    if (id && !seen.has(id)) {
      seen.add(id);
      results.push({ id, name: node.species.name, sprite: '' });
    }
    node.evolves_to.forEach(walk);
  }

  walk(link);
  return results;
}
