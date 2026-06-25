import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { PokemonService } from './pokemon.service';
import type { PokemonDetail, PokemonSummary } from './pokemon.types';

const MAX_ID = 150;

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  getList(): Promise<PokemonSummary[]> {
    return this.pokemonService.getList();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<PokemonDetail> {
    if (id < 1 || id > MAX_ID) {
      throw new NotFoundException(`Pokémon ${id} not found`);
    }
    return this.pokemonService.getById(id);
  }
}
