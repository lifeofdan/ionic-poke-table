import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
import { DataService, TPokemonResponse } from '../services/data.service';

type TPokemon = TPokemonResponse & {
  spriteUrl: string;
  capture_rate: number;
};

@Component({
  selector: 'app-view-message',
  templateUrl: './view-pokemon.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ViewPokemonPage implements OnInit {
  private data = inject(DataService);
  public pokemon: TPokemon | null = null;
  private activatedRoute = inject(ActivatedRoute);
  private platform = inject(Platform);

  constructor() {}

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.pokemon = this.getPokemon(id);
  }

  getPokemon(id: string): TPokemon | null {
    const imageBaseUrl =
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

    this.data.getPokemonById(id).subscribe((data: TPokemonResponse) => {
      const aPokemon = {
        ...data,
        capture_rate: 0,
        spriteUrl: `${imageBaseUrl}${id}.png`,
      };
      this.pokemon = aPokemon;

      this.data
        .getPokemonCaptureRateById(id)
        .subscribe((data: { capture_rate: number }) => {
          aPokemon.capture_rate = Math.floor((data.capture_rate / 255) * 100);
        });
    });

    return null;
  }

  getBackButtonText() {
    const isIos = this.platform.is('ios');
    return isIos ? '' : '';
  }
}
