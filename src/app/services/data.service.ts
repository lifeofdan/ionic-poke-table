import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// This is not an exhaustive type, only things wanted were added
export type TPokemonResponse = {
  id: string;
  height: number;
  weight: number;
  base_experience: number;
  name: string;
  types: { slot: number; type: { name: string; url: string } }[];
};

type TLanguage = {
  name: string;
  url: string;
};

export type PokeRegionResponse = {
  id: number;
  locations: { name: string; url: string }[];
  main_generation: {
    name: string;
    url: string;
  };
  name: string;
  names: { language: TLanguage; name: string }[];
  pokedexes: { name: string; url: string }[];
};

export type PokemonEntry = {
  entry_number: number;
  pokemon_species: { name: string; url: string };
};

export type PokedexResponse = {
  id: number;
  descriptions: {
    description: string;
    language: TLanguage;
  }[];
  is_main_series: boolean;
  name: string;
  names: { language: TLanguage; name: string }[];
  pokemon_entries: PokemonEntry[];
  region: { name: string; url: string };
  version_groups: { name: string; url: string }[];
};

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  public getPokemon() {
    return this.http.get<PokeRegionResponse>(
      'https://pokeapi.co/api/v2/region/kanto'
    );
  }

  public getPokedexByUrl(url: string) {
    return this.http.get<PokedexResponse>(url);
  }

  public getPokemonById(id: string) {
    return this.http.get<TPokemonResponse>(
      `https://pokeapi.co/api/v2/pokemon/${id}`
    );
  }

  public getPokemonCaptureRateById(id: string) {
    return this.http.get<{ capture_rate: number }>(
      `https://pokeapi.co/api/v2/pokemon-species/${id}`
    );
  }
}
