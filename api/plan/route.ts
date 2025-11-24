// frontend/src/app/api/plan/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Token kommt aus Render Environment (HF_TOKEN)
const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = 'meta-llama/Llama-3.2-3B-Instruct';
const HF_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { depot, maxWeightKg, orders, meta } = body;

  // Validierung
  if (!Array.isArray(orders) || orders.length === 0) {
    return NextResponse.json({ error: 'Keine Bestellungen vorhanden' }, { status: 400 });
  }

  if (!HF_TOKEN) {
    return NextResponse.json({ error: 'HF_TOKEN fehlt in Environment-Variablen' }, { status: 500 });
  }

  // Prompt – zwingt die KI zu sauberem JSON
  const prompt = `Du bist ein erfahrener Disponent in der Logistik.
Depot: ${depot.name}, ${depot.street}, ${depot.zip} ${depot.city}
Maximales Gewicht pro Tour: ${maxWeightKg} kg

Plane optimale Touren. Gruppiere nach PLZ-Nähe, berücksichtige Liefertermine und Gewicht.
Antworte AUSSCHLIESSLICH mit gültigem JSON – kein weiterer Text!

{
  "tours": [
    {
      "id": "Tour-1",
      "name": "Tour Ruhrgebiet",
      "region": "Nordrhein-Westfalen",
      "deliveryWindow": "Vormittag",
      "orders": [/* komplette Bestellobjekte hier */],
      "weight": 987.4,
      "stops": 6,
      "distance": 142,
      "aiScore": 92
    }
  ],
  "meta": { "strategy": "PLZ-Clustering + Termin", "totalTours": 3 }
}

Bestellungen:
${JSON.stringify(orders, null, 2)}`;

  try {
    const response = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.7,
          return_full_text: false,
          wait_for_model: true,   // wartet, bis Modell bereit ist
          max_time: 90,           // max. 90 Sekunden warten
        },
      }),
    });

    // ----- ROBUSTE Fehlerbehandlung (das rettet uns vor "Unexpected end of JSON") -----
    const text = await response.text(); // immer als Text lesen!

    if (!response.ok) {
      console.error('Hugging Face Fehler:', response.status, text);
      // Fallback-Tour, damit die App nie crasht
      return fallbackResponse(orders, 'KI gerade beschäftigt – Fallback aktiv');
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('HF hat kein JSON zurückgegeben:', text);
      return fallbackResponse(orders, 'Antwort ungültig – Fallback');
    }

    const generated = data[0]?.generated_text || '';
    const jsonMatch = generated.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.warn('Kein JSON im Output gefunden:', generated);
      return fallbackResponse(orders, 'Kein JSON gefunden – Fallback');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const tours = Array.isArray(parsed.tours) ? parsed.tours : [];

    return NextResponse.json({
      tours,
      meta: parsed.meta || meta || { strategy: 'KI-Planung' },
    });

  } catch (error: any) {
    console.error('Unerwarteter Fehler in /api/plan:', error);
    return fallbackResponse(orders, 'Unbekannter Fehler – bitte gleich nochmal');
  }
}

// Hilfsfunktion für schöne Fallback-Touren (verhindert Crash)
function fallbackResponse(orders: any[], reason: string) {
  const totalWeight = orders.reduce((s: number, o: any) => s + (o.weight || 0), 0);

  return NextResponse.json({
    tours: [
      {
        id: 'Fallback-1',
        name: 'Einzel-Tour (Fallback)',
        region: 'Deutschland',
        deliveryWindow: 'Ganztägig',
        orders: orders,
        weight: totalWeight,
        stops: orders.length,
        distance: Math.round(totalWeight / 3), // grobe Schätzung
        aiScore: 65,
      },
    ],
    meta: { strategy: `Fallback – ${reason}` },
  });
}