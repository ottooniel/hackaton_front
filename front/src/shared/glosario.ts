export const glosario = {
  ebit: 'Utilidad operativa: lo que gana el negocio con su operación, antes de intereses e impuestos.',
  roic: 'Retorno sobre el capital invertido: cuánta utilidad genera cada quetzal puesto en el negocio, después de impuestos.',
  wacc: 'Costo del capital: el rendimiento mínimo que debería dar el dinero invertido. Aquí es 11%.',
  eva: 'Valor económico agregado: lo que queda después de pagar el costo del capital. Negativo significa que rinde menos de lo que cuesta financiarse.',
  intercompania: 'Ventas y compras entre empresas del mismo grupo. Al consolidar se eliminan para no contar dos veces lo mismo.',
  tasa: 'Cuántas unidades de moneda local equivalen a 1 quetzal. Se usa para llevar todo a GTQ.',
  efecto_operativo: 'Cambio por el negocio en sí (ventas y costos), medido con la misma tasa de cambio.',
  efecto_cambiario: 'Cambio que viene solo del movimiento de la tasa de cambio, aunque el negocio no haya cambiado.',
  compuerta: 'Regla que impide publicar el total del grupo mientras haya errores que lo vuelvan engañoso.',
} as const;

export type ClaveGlosario = keyof typeof glosario;
