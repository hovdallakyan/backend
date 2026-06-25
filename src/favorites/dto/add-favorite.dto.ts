import { IsInt, Max, Min } from 'class-validator';

export class AddFavoriteDto {
  @IsInt()
  @Min(1)
  @Max(150)
  pokemonId: number;
}
