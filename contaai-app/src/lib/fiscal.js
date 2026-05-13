export function generateProfessionalFiscalPDF(tipo, datos) {
  const { ingresos, gastos } = datos;
  const ivaAIngresar = ((ingresos - gastos) * 0.21).toFixed(2);
  const irpfAIngresar = ((ingresos - gastos) * 0.20).toFixed(2);

  let txt = `MODELO ${tipo} - ContaAI ${new Date().getFullYear()}\n\nINGRESOS: ${ingresos}€\nGASTOS: ${gastos}€\nA INGRESAR: ${tipo === "303" ? ivaAIngresar : irpfAIngresar}€`;

  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(txt));
  element.setAttribute("download", `Modelo_${tipo}_${new Date().getFullYear()}.txt`);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
