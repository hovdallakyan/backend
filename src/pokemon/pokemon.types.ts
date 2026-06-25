export interface PokemonSummary {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

export interface EvolutionOption {
  id: number;
  name: string;
  sprite: string;
}

export interface PokemonDetail {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  abilities: string[];
  evolutions: EvolutionOption[];
}
