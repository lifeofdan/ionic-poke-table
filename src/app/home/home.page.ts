import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { IonicModule, IonInput, RefresherCustomEvent } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { toXML } from 'jstoxml';
import {
  DataService,
  PokemonEntry,
  PokeRegionResponse,
  PokedexResponse,
} from '../services/data.service';

type PokemonItem = PokemonEntry & {
  spriteUrl: string;
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink],
})
export class HomePage implements OnInit {
  private data = inject(DataService);
  public pokemon: PokemonItem[] = [];
  public originalPokemonList: PokemonItem[] = [];
  public searchText: string = '';
  private csvContent = 'id,name,link\n';

  constructor() {}

  ngOnInit() {
    this.getPokemon();
  }

  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 3000);
  }

  getPokemon(): PokemonItem[] {
    const imageBaseUrl =
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

    this.data.getPokemon().subscribe((data: PokeRegionResponse) => {
      const pokedex = data.pokedexes.find(
        (pokedex) => pokedex.name === 'kanto'
      );

      if (!pokedex) return this.pokemon;

      this.data
        .getPokedexByUrl(pokedex.url)
        .subscribe((data: PokedexResponse) => {
          data.pokemon_entries.forEach((entry) => {
            const anEntry = {
              spriteUrl: `${imageBaseUrl}${entry.entry_number}.png`,
              ...entry,
            };
            this.pokemon.push(anEntry);
          });
          this.originalPokemonList = this.pokemon;

          return this.pokemon;
        });

      return this.pokemon;
    });
    return this.pokemon;
  }

  filterPokemonByName(e: Event): PokemonItem[] {
    /*
      We assert this type because it is what is actually returned by the event,
      even though the template believes it to just be an "Event" type.
    */
    const event = e as CustomEvent<IonInput>;

    if (!event.detail.value || typeof event.detail.value !== 'string')
      return (this.pokemon = this.originalPokemonList);

    // We can assert because we have already checked above that the value exists and is of type string
    const filteredPokemon = this.originalPokemonList.filter((pokemon) =>
      pokemon.pokemon_species.name
        .toLowerCase()
        .includes(event.detail.value as string)
    );

    return (this.pokemon = filteredPokemon);
  }

  exportToXML() {
    // I don't like this weird space indent but this was the most popular json to xml package that didn't require a polyfil.
    const xml = toXML(this.pokemon, { indent: '    ' });
    const blob = new Blob([xml], {
      type: 'application/xml',
    });

    this.saveFile(blob, 'xml');
  }

  exportToJson() {
    const blob = new Blob([JSON.stringify(this.pokemon, null, 2)], {
      type: 'application/json',
    });

    this.saveFile(blob, 'json');
  }

  exportToCSV() {
    this.pokemonItemsToCSV();
    const blob = new Blob([this.csvContent], {
      type: 'text/csv',
    });
    this.saveFile(blob, 'csv');
  }

  saveFile(blob: Blob, type: 'csv' | 'json' | 'xml') {
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `pokelist${type}.${type}`;
    anchor.click();
  }

  pokemonItemsToCSV() {
    this.csvContent = 'id,name,link\n';

    this.pokemon.forEach((p) => {
      this.csvContent += `${p.entry_number},${p.pokemon_species.name},${environment.app_url}/pokemon/${p.entry_number}\n`;
    });
  }
}
