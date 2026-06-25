import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PokemonService } from '../pokemon/pokemon.service';
import { Favorite } from './favorite.entity';

export interface FavoriteDto {
  pokemonId: number;
  name: string;
  sprite: string;
  createdAt: string;
}

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly repo: Repository<Favorite>,
    private readonly pokemonService: PokemonService,
  ) {}

  async findAll(): Promise<FavoriteDto[]> {
    const rows = await this.repo.find({ order: { createdAt: 'ASC' } });
    return rows.map((f) => this.toDto(f));
  }

  async add(pokemonId: number): Promise<FavoriteDto> {
    const existing = await this.repo.findOneBy({ pokemonId });
    if (existing) {
      throw new ConflictException(`Pokémon ${pokemonId} is already a favorite`);
    }

    const summary = await this.pokemonService.getSummaryById(pokemonId);

    const entity = this.repo.create({
      pokemonId,
      name: summary.name,
      sprite: summary.sprite,
    });
    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async remove(pokemonId: number): Promise<void> {
    await this.repo.delete({ pokemonId });
  }

  private toDto(f: Favorite): FavoriteDto {
    return {
      pokemonId: f.pokemonId,
      name: f.name,
      sprite: f.sprite,
      createdAt: f.createdAt.toISOString(),
    };
  }
}
