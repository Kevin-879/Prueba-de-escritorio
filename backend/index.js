import { A_Insertar } from "./insertar.js";
import { A_Consultar } from "./consultar.js";
import { A_Eliminar } from "./eliminar.js";
import { A_Actualizar } from "./actualizar.js";
import { A_Login } from "./login.js";

const ser_Insertar = new A_Insertar(3001);
const ser_Consultar = new A_Consultar(3002);
const ser_Actualizar = new A_Actualizar(3004);
const ser_Eliminar = new A_Eliminar(3003);
const ser_Login = new A_Login(3005);

ser_Insertar.iniciar();
ser_Consultar.iniciar();
ser_Actualizar.iniciar();
ser_Eliminar.iniciar();
ser_Login.iniciar();