import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { AddFavoriteDto } from './dto/add-favorite.dto';
import { FavoritesService, FavoriteDto } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(): Promise<FavoriteDto[]> {
    return this.favoritesService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  add(@Body() dto: AddFavoriteDto): Promise<FavoriteDto> {
    return this.favoritesService.add(dto.pokemonId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.favoritesService.remove(id);
  }
}
