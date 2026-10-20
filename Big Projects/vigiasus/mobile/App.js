import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function requestJson(path, options) {
  const response = await fetch(`${API_URL}${path}`, options);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || `Falha na API (${response.status}).`);
  }
  return result;
}

export default function App() {
  const [areas, setAreas] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selected, setSelected] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  const loadAreas = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await requestJson("/api/areas");
      setAreas(result.areas);
      setSummary(result.summary);
      setSelected((current) => result.areas.find((area) => area.id === current?.id) || result.areas[0]);
    } catch (requestError) {
      setError(`${requestError.message} Confira se a API está ligada e se EXPO_PUBLIC_API_URL aponta para ela.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  async function searchKnowledge() {
    if (question.trim().length < 3) {
      setError("Digite uma pergunta com pelo menos 3 caracteres.");
      return;
    }
    setAsking(true);
    setError("");
    setAnswer(null);
    try {
      setAnswer(await requestJson("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAsking(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandMark}><Text style={styles.brandLetter}>V</Text></View>
          <Text style={styles.brand}>Vigia<Text style={styles.brandGreen}>SUS</Text></Text>
          <Text style={styles.headerPlace}>RECIFE · DEMO</Text>
        </View>

        <Text style={styles.eyebrow}>INTELIGÊNCIA ARTIFICIAL · SAÚDE PÚBLICA</Text>
        <Text style={styles.title}>Vigilância que{"\n"}explica seus sinais.</Text>
        <Text style={styles.subtitle}>Explore indicadores territoriais fictícios para uma demonstração de vigilância da dengue.</Text>

        <View style={styles.warning}>
          <Text style={styles.warningIcon}>!</Text>
          <Text style={styles.warningText}>Dados simulados. Não é uma ferramenta oficial nem deve orientar decisões reais.</Text>
        </View>

        <View style={styles.summaryGrid}>
          <Summary label="ÁREAS" value={summary?.monitored_areas ?? "—"} />
          <Summary label="EM ATENÇÃO" value={summary?.attention_areas ?? "—"} />
          <Summary label="CHUVA DEMO" value={summary ? `${summary.rainfall_mm} mm` : "—"} />
        </View>

        <View style={styles.sectionHeading}>
          <View><Text style={styles.eyebrow}>VISÃO TERRITORIAL</Text><Text style={styles.sectionTitle}>Sinais por área</Text></View>
          <Pressable onPress={loadAreas} accessibilityRole="button"><Text style={styles.refresh}>Atualizar</Text></Pressable>
        </View>

        {loading ? <ActivityIndicator color="#18856c" style={styles.loader} /> : (
          <View style={styles.areaList}>
            {areas.map((area) => (
              <Pressable
                key={area.id}
                onPress={() => setSelected(area)}
                style={[styles.areaCard, selected?.id === area.id && styles.areaSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected: selected?.id === area.id }}
              >
                <View style={styles.areaNameRow}>
                  <Text style={styles.areaName}>{area.name}</Text>
                  <Text style={[styles.riskBadge, riskStyle(area.risk_level)]}>{area.risk_level}</Text>
                </View>
                <Text style={styles.areaScore}>Índice demonstrativo {area.risk_score}/100</Text>
                <View style={styles.track}><View style={[styles.fill, { width: `${area.risk_score}%`, backgroundColor: riskColor(area.risk_level) }]} /></View>
              </Pressable>
            ))}
          </View>
        )}

        {selected && (
          <View style={styles.card}>
            <Text style={styles.eyebrow}>FATORES DO ÍNDICE</Text>
            <Text style={styles.sectionTitle}>{selected.name} · {selected.risk_score}/100</Text>
            <Factor label="Notificações fictícias · peso 40%" value={selected.signals.notifications} />
            <Factor label="Chuva fictícia · peso 35%" value={selected.signals.rainfall} />
            <Factor label="Condição ambiental · peso 25%" value={selected.signals.environment} />
            <Text style={styles.smallNote}>Soma ponderada demonstrativa; não é previsão treinada ou validada.</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.eyebrow}>RAG · BASE DOCUMENTAL LOCAL</Text>
          <Text style={styles.sectionTitle}>Pergunte sobre o projeto</Text>
          <Text style={styles.bodyCopy}>A busca recupera trechos dos arquivos Markdown; a resposta mostra as fontes usadas.</Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Como o índice é calculado?"
            placeholderTextColor="#98a59e"
            style={styles.input}
            multiline
            maxLength={1000}
          />
          <Pressable style={styles.askButton} onPress={searchKnowledge} disabled={asking}>
            {asking ? <ActivityIndicator color="#fff" /> : <Text style={styles.askButtonText}>Buscar na base</Text>}
          </Pressable>
          {answer && (
            <View style={styles.answerBox}>
              <Text style={styles.answerText}>{answer.answer}</Text>
              <Text style={styles.sourceText}>Modo: {answer.mode} · Fontes: {answer.sources.map((source) => source.file).join(", ") || "nenhuma"}</Text>
            </View>
          )}
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Text style={styles.footer}>VigiaSUS · Protótipo acadêmico · Dados fictícios · Não é orientação médica.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Summary({ label, value }) {
  return <View style={styles.summaryCard}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue}>{value}</Text></View>;
}

function Factor({ label, value }) {
  return <View style={styles.factor}>
    <View style={styles.factorLabel}><Text style={styles.bodyCopy}>{label}</Text><Text style={styles.factorValue}>{value}/100</Text></View>
    <View style={styles.track}><View style={[styles.fill, { width: `${value}%` }]} /></View>
  </View>;
}

function riskColor(level) {
  if (level === "elevado") return "#c4574e";
  if (level === "moderado") return "#c4821d";
  return "#18856c";
}

function riskStyle(level) {
  return { color: riskColor(level), backgroundColor: level === "elevado" ? "#fbefed" : level === "moderado" ? "#fcf4e7" : "#edf7f1" };
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f8f6" },
  page: { paddingHorizontal: 20, paddingBottom: 36 },
  header: { height: 58, flexDirection: "row", alignItems: "center", marginBottom: 27 },
  brandMark: { width: 30, height: 30, borderRadius: 10, backgroundColor: "#18856c", alignItems: "center", justifyContent: "center", marginRight: 9 },
  brandLetter: { color: "#fff", fontWeight: "800", fontSize: 17 },
  brand: { color: "#172c29", fontWeight: "800", fontSize: 19 },
  brandGreen: { color: "#18856c", fontWeight: "500" },
  headerPlace: { marginLeft: "auto", color: "#829089", fontSize: 9, letterSpacing: 1, fontWeight: "700" },
  eyebrow: { color: "#18856c", fontSize: 9, letterSpacing: 1.2, fontWeight: "700", marginBottom: 8 },
  title: { color: "#172c29", fontSize: 35, lineHeight: 40, letterSpacing: -1.2, fontWeight: "800" },
  subtitle: { color: "#72807b", fontSize: 13, lineHeight: 20, marginTop: 9, marginBottom: 16 },
  warning: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff8eb", borderColor: "#f2e6ce", borderWidth: 1, borderRadius: 9, padding: 12, marginBottom: 15 },
  warningIcon: { color: "#a5701d", backgroundColor: "#f5e8ca", borderRadius: 12, overflow: "hidden", textAlign: "center", textAlignVertical: "center", width: 23, height: 23, fontWeight: "800", marginRight: 9 },
  warningText: { flex: 1, color: "#755b2c", fontSize: 10, lineHeight: 15 },
  summaryGrid: { flexDirection: "row", gap: 8, marginBottom: 25 },
  summaryCard: { flex: 1, backgroundColor: "#fff", borderColor: "#e6ece8", borderWidth: 1, borderRadius: 9, padding: 11 },
  summaryLabel: { color: "#83908a", fontSize: 8, letterSpacing: .5, fontWeight: "700" },
  summaryValue: { color: "#172c29", fontSize: 20, fontWeight: "800", marginTop: 6 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { color: "#172c29", fontSize: 17, fontWeight: "800", marginBottom: 4 },
  refresh: { color: "#18856c", fontSize: 11, fontWeight: "700" },
  loader: { padding: 24 },
  areaList: { gap: 8 },
  areaCard: { backgroundColor: "#fff", borderColor: "#e6ece8", borderWidth: 1, borderRadius: 9, padding: 12 },
  areaSelected: { borderColor: "#4c9e82", borderWidth: 2 },
  areaNameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  areaName: { color: "#263a32", fontWeight: "700", fontSize: 12 },
  riskBadge: { overflow: "hidden", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, fontSize: 9, fontWeight: "700", textTransform: "capitalize" },
  areaScore: { color: "#89948f", fontSize: 9, marginTop: 7, marginBottom: 6 },
  track: { height: 5, backgroundColor: "#edf1ee", borderRadius: 5, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: "#18856c", borderRadius: 5 },
  card: { backgroundColor: "#fff", borderColor: "#e6ece8", borderWidth: 1, borderRadius: 10, padding: 15, marginTop: 13 },
  factor: { marginTop: 12 },
  factorLabel: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  factorValue: { color: "#42544c", fontSize: 10, fontWeight: "700" },
  bodyCopy: { color: "#72807b", fontSize: 10, lineHeight: 16 },
  smallNote: { color: "#89948f", fontSize: 9, lineHeight: 14, marginTop: 12 },
  input: { minHeight: 66, maxHeight: 120, textAlignVertical: "top", borderWidth: 1, borderColor: "#e1e9e4", borderRadius: 7, padding: 10, color: "#263a32", fontSize: 12, marginTop: 12 },
  askButton: { alignItems: "center", justifyContent: "center", minHeight: 40, backgroundColor: "#18856c", borderRadius: 7, marginTop: 9 },
  askButtonText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  answerBox: { backgroundColor: "#f3f8f5", borderRadius: 7, padding: 11, marginTop: 11 },
  answerText: { color: "#43564b", fontSize: 10, lineHeight: 16 },
  sourceText: { color: "#718278", fontSize: 9, lineHeight: 14, marginTop: 8 },
  error: { color: "#9f3d36", backgroundColor: "#fbefed", borderRadius: 7, padding: 10, marginTop: 12, fontSize: 10, lineHeight: 15 },
  footer: { color: "#8b9791", fontSize: 9, lineHeight: 14, textAlign: "center", marginTop: 22 },
});
