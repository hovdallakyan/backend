import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('favorites')
export class Favorite {
  @PrimaryColumn()
  pokemonId: number;

  @Column()
  name: string;

  @Column()
  sprite: string;

  @CreateDateColumn()
  createdAt: Date;
}
