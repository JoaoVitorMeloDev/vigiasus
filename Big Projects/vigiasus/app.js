"use strict";

const BASE_RAINFALL = 48;
const areas = [
  { id: "santo-amaro", name: "Santo Amaro", reports: 56, environment: 67, rainfall: 59 },
  { id: "boa-vista", name: "Boa Vista", reports: 37, environment: 54, rainfall: 51 },
  { id: "casa-amarela", name: "Casa Amarela", reports: 63, environment: 58, rainfall: 64 },
  { id: "varzea", name: "Várzea", reports: 29, environment: 48, rainfall: 53 },
  { id: "afogados", name: "Afogados", reports: 73, environment: 72, rainfall: 70 },
  { id: "ibura", name: "Ibura", reports: 44, environment: 61, rainfall: 57 },
  { id: "pina", name: "Pina", reports: 25, environment: 41, rainfall: 45 },
  { id: "beberibe", name: "Beberibe", reports: 51, environment: 65, rainfall: 62 },
  { id: "torrões", name: "Torrões", reports: 68, environment: 73, rainfall: 66 },
  { id: "derby", name: "Derby", reports: 21, environment: 38, rainfall: 42 },
  { id: "coque", name: "Ilha do Leite", reports: 33, environment: 46, rainfall: 48 },
  { id: "dois-irmaos", name: "Dois Irmãos", reports: 31, environment: 52, rainfall: 57 },
];

const elements = {
  areaCount: document.querySelector("#area-count"),
  attentionCount: document.querySelector("#attention-count"),
  averageRisk: document.querySelector("#average-risk"),
  rainfallIndicator: document.querySelector("#rainfall-indicator"),
  territoryGrid: document.querySelector("#territory-grid"),
  selectedName: document.querySelector("#selected-name"),
  selectedStatus: document.querySelector("#selected-status"),
  selectedRisk: document.querySelector("#selected-risk"),
  rainValue: document.querySelector("#rain-value"),
  caseValue: document.querySelector("#case-value"),
  environmentValue: document.querySelector("#environment-value"),
  rainBar: document.querySelector("#rain-bar"),
  caseBar: document.querySelector("#case-bar"),
  environmentBar: document.querySelector("#environment-bar"),
  explanation: document.querySelector("#explanation"),
  rainSlider: document.querySelector("#rain-slider"),
  rainOutput: document.querySelector("#rain-output"),
  periodSelect: document.querySelector("#period-select"),
  aboutButton: document.querySelector("#about-button"),
  aboutDialog: document.querySelector("#about-dialog"),
  resetButton: document.querySelector("#reset-button"),
};

let selectedAreaId = "afogados";

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function getRisk(area) {
  const rainfallScenario = Number(elements.rainSlider.value);
  const period = Number(elements.periodSelect.value);
  const rainfallSignal = clamp(area.rainfall + (rainfallScenario - BASE_RAINFALL) * 0.55);
  const timeAdjustedReports = clamp(area.reports * (14 / period));
  const score = Math.round(
    rainfallSignal * 0.35 + timeAdjustedReports * 0.4 + area.environment * 0.25,
  );

  return {
    score: clamp(score),
    rainfallSignal: Math.round(rainfallSignal),
    timeAdjustedReports: Math.round(timeAdjustedReports),
  };
}

function getRiskLevel(score) {
  if (score >= 65) return { label: "Atenção elevada", className: "high" };
  if (score >= 45) return { label: "Atenção moderada", className: "medium" };
  return { label: "Atenção regular", className: "low" };
}

function updateBar(element, value) {
  element.style.width = `${clamp(value)}%`;
}

function getExplanation(area, risk) {
  const factors = [
    { name: "notificações simuladas", value: risk.timeAdjustedReports },
    { name: "sinal de chuva", value: risk.rainfallSignal },
    { name: "condição ambiental", value: area.environment },
  ].sort((first, second) => second.value - first.value);

  return `Neste cenário fictício, ${factors[0].name} é o maior componente do índice. O cálculo combina notificações (40%), chuva (35%) e condição ambiental (25%); esses pesos são ilustrativos, não foram treinados nem validados.`;
}

function renderTerritory() {
  elements.territoryGrid.replaceChildren();

  for (const area of areas) {
    const risk = getRisk(area);
    const level = getRiskLevel(risk.score);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `area-button ${level.className}`;
    button.setAttribute("aria-pressed", String(area.id === selectedAreaId));
    button.setAttribute("aria-label", `${area.name}: índice demonstrativo ${risk.score} de 100, ${level.label}`);

    const name = document.createElement("span");
    name.className = "area-name";
    name.textContent = area.name;

    const score = document.createElement("span");
    score.className = "area-risk";
    score.textContent = `Índice ${risk.score}/100`;

    button.append(name, score);
    button.addEventListener("click", () => {
      selectedAreaId = area.id;
      render();
    });
    elements.territoryGrid.append(button);
  }
}

function renderSelectedArea() {
  const area = areas.find((candidate) => candidate.id === selectedAreaId);
  if (!area) return;

  const risk = getRisk(area);
  const level = getRiskLevel(risk.score);
  elements.selectedName.textContent = area.name;
  elements.selectedRisk.textContent = String(risk.score);
  elements.selectedStatus.textContent = level.label;
  elements.selectedStatus.className = `risk-pill ${level.className}`;
  elements.rainValue.textContent = `${risk.rainfallSignal}/100`;
  elements.caseValue.textContent = `${risk.timeAdjustedReports}/100`;
  elements.environmentValue.textContent = `${area.environment}/100`;
  updateBar(elements.rainBar, risk.rainfallSignal);
  updateBar(elements.caseBar, risk.timeAdjustedReports);
  updateBar(elements.environmentBar, area.environment);
  elements.explanation.textContent = getExplanation(area, risk);
}

function renderMetrics() {
  const risks = areas.map((area) => getRisk(area).score);
  const attentionCount = risks.filter((score) => score >= 45).length;
  const averageRisk = Math.round(risks.reduce((sum, score) => sum + score, 0) / risks.length);

  elements.areaCount.textContent = String(areas.length);
  elements.attentionCount.textContent = String(attentionCount);
  elements.averageRisk.textContent = String(averageRisk);
  elements.rainfallIndicator.textContent = elements.rainSlider.value;
  elements.rainOutput.value = `${elements.rainSlider.value} mm`;
  elements.rainOutput.textContent = `${elements.rainSlider.value} mm`;
}

function render() {
  renderMetrics();
  renderTerritory();
  renderSelectedArea();
}

elements.rainSlider.addEventListener("input", render);
elements.periodSelect.addEventListener("change", render);
elements.resetButton.addEventListener("click", () => {
  elements.rainSlider.value = String(BASE_RAINFALL);
  elements.periodSelect.value = "14";
  render();
});
elements.aboutButton.addEventListener("click", () => elements.aboutDialog.showModal());

render();
