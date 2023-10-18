import {
  inquirerMenu,
  leerInput,
  listarLugares,
  pausa,
} from './helpers/inquirer.js';
import { default as axios } from 'axios';
import { Busquedas } from './models/busquedas.js';
import 'dotenv/config';


const main = async () => {

  const busquedas = new Busquedas();
  let opt;

  do {
    opt = await inquirerMenu();
    console.log({ opt });

    switch (opt) {
      case 1:
        //Solicitar que el usuario escriba el lugar deseado
        const lugarBusqueda = await leerInput('Ciudad: ');

        //Buscar lugar ingresado por el usuario 
        const lugares = await busquedas.ciudad(lugarBusqueda);

        //Selección del lugar
        const idSelect = await listarLugares(lugares);
        if (idSelect === '0') continue;

        const lugarSelec = lugares.find((l) => l.id === idSelect);

        //Guardar historial
        busquedas.agregarHistorial(lugarSelec.nombre);

        //Clima
        const climaLugar = await busquedas.climaLugar(
          lugarSelec.lat,
          lugarSelec.lng
        );

        //Mostrar resultados
        console.log('\n Información de la ciudad \n'.blue);
        console.log('Ciudad:', lugarSelec.nombre);
        console.log('Lat:', lugarSelec.lat);
        console.log('Lng:', lugarSelec.lng);
        console.log('Temperatura:', climaLugar.temp);
        console.log('Mínima:', climaLugar.min);
        console.log('Máxima:', climaLugar.max);
        break;
      case 2:
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}. `.blue;
          console.log(`${idx} ${lugar}`);
        });
        break;
    }

    if (opt !== 0) {
      await pausa();
    }
  } while (opt !== 0);
};

main();


/*By Yazmin V Soriano Cruz */