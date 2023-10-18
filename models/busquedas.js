import * as fs from 'fs';
import { default as axios } from 'axios';
import { inquirerMenu, leerInput } from '../helpers/inquirer.js';

export class Busquedas {
  historial = [];
  dbPath = './db/database.json';

  constructor() {
    //TODO: Leer DB si existe
    this.leerDB();
  }

  get historialCapitalizado() {
    return this.historial.map((lugar) => {
      let palabras = lugar.split(' ');
      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));
      return palabras.join(' ');
    });
  }

  //https://api.mapbox.com/geocoding/v5/mapbox.places/VERAC.json?proximity=ip&language=es&access_token=pk.eyJ1IjoieWF6bWluc29yaWFubyIsImEiOiJjbGZza2xycjgwNnowM2twcTcyMDB0dWhpIn0.ApZAgy7Kxy2h8uPzHwYhAw

  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY || '',
      limit: 5,
      language: 'es',
      proximity: 'ip',
    };
  }
  //https://api.openweathermap.org/data/2.5/weather?lat=19.179886&lon=-96.135648&appid=bb54d08f59755fb2735e25ec8ebd68e6&units=metric&lang=es
  get paramsOpenWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: 'metric',
      lang: 'es',
    };
  }

  async ciudad(lugar = '') {
    console.log('recibido:  ' + lugar);
    try {
      //Petición http
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });

      const resp = await instance.get();
      // console.log(resp.data.features);
      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {
      return error;
    }
  }

  async climaLugar(lat, lon) {
    try {
      //instance axios
      const instanceClima = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsOpenWeather, lat, lon },
      });

      //obtener data de la respuesta
      const respWeather = await instanceClima.get();
      const { weather, main } = respWeather.data;

      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      return error;
    }
  }

  agregarHistorial(lugar = '') {
    //TO DO: prevenir duplicados

    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }
    this.historial = this.historial.splice(0, 5);

    this.historial.unshift(lugar);

    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };

    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    if (!fs.existsSync(this.dbPath)) return;

    const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });

    const data = JSON.parse(info);

    this.historial = data.historial;
  }
}
