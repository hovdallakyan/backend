import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

import type {
  PokeApiEvolutionChain,
  PokeApiListResponse,
  PokeApiPokemon,
  PokeApiSpecies,
} from './pokeapi.types';
import {
  extractIdFromUrl,
  flattenEvolutionChain,
  toPokemonDetail,
  toPokemonSummary,
} from './pokemon.mapper';
import type { PokemonDetail, PokemonSummary } from './pokemon.types';

const LIST_LIMIT = 150;
const BATCH_SIZE = 10;

@Injectable()
export class PokemonService {
  private readonly baseUrl: string;
  private listCache: PokemonSummary[] | null = null;
  private readonly detailCache = new Map<number, PokemonDetail>();

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl = config.getOrThrow<string>('POKEAPI_BASE_URL');
  }

  async getList(): Promise<PokemonSummary[]> {
    if (this.listCache) return this.listCache;

    const list = await this.fetch<PokeApiListResponse>(
      `pokemon?limit=${LIST_LIMIT}`,
    );
    const ids = list.results
      .map((r) => extractIdFromUrl(r.url))
      .filter((id) => id >= 1 && id <= LIST_LIMIT);

    const summaries: PokemonSummary[] = [];
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batch = ids.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (id) => {
          const raw = await this.fetch<PokeApiPokemon>(`pokemon/${id}`);
          return toPokemonSummary(raw);
        }),
      );
      summaries.push(...results);
    }

    this.listCache = summaries.sort((a, b) => a.id - b.id);
    return this.listCache;
  }

  async getById(id: number): Promise<PokemonDetail> {
    const cached = this.detailCache.get(id);
    if (cached) return cached;

    const [raw, species] = await Promise.all([
      this.fetch<PokeApiPokemon>(`pokemon/${id}`),
      this.fetch<PokeApiSpecies>(`pokemon-species/${id}`),
    ]);
    const chain = await this.fetch<PokeApiEvolutionChain>(
      species.evolution_chain.url,
    );

    const evolutions = flattenEvolutionChain(chain.chain);
    for (const evo of evolutions) {
      if (!evo.sprite) {
        try {
          const evoRaw = await this.fetch<PokeApiPokemon>(
            `pokemon/${evo.id}`,
          );
          evo.sprite = evoRaw.sprites.front_default ?? '';
        } catch {
          evo.sprite = '';
        }
      }
    }

    const detail = toPokemonDetail(raw, evolutions);
    this.detailCache.set(id, detail);
    return detail;
  }

  async getSummaryById(id: number): Promise<PokemonSummary> {
    const list = await this.getList();
    const fromList = list.find((p) => p.id === id);
    if (fromList) return fromList;

    const raw = await this.fetch<PokeApiPokemon>(`pokemon/${id}`);
    return toPokemonSummary(raw);
  }

  private async fetch<T>(path: string): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}/${path}`;
    try {
      const { data } = await firstValueFrom(this.http.get<T>(url));
      return data;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) {
        throw new NotFoundException(`Resource not found: ${path}`);
      }
      throw new BadGatewayException('Upstream PokéAPI request failed');
    }
  }
}
