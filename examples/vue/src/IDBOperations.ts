import { DataClass, KeyPath } from 'idb-ts/lib';

@DataClass()
export class User {
  @KeyPath()
  name: string;
  age: number;
  cell?: string;
  address: string;

  constructor(name: string, age: number, address: string, cell?: string) {
    this.name = name;
    this.age = age;
    this.address = address;
    this.cell = cell;
  }
}

@DataClass()
export class Location {
  @KeyPath()
  id: string;
  city: string;
  country: string;

  constructor(id: string, city: string, country: string) {
    this.id = id;
    this.city = city;
    this.country = country;
  }
}