export interface PokeApiListResponse {
  results: { name: string; url: string }[];
}

export interface PokeApiPokemon {
  id: number;
  name: string;
  sprites: { front_default: string | null };
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
}

export interface PokeApiSpecies {
  evolution_chain: { url: string };
}

export interface PokeApiEvolutionLink {
  species: { name: string; url: string };
  evolves_to: PokeApiEvolutionLink[];
}

export interface PokeApiEvolutionChain {
  chain: PokeApiEvolutionLink;
}
