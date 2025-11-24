// frontend/src/app/api/plan/route.ts
import { NextRequest, NextResponse } from 'next/server';

// WICHTIG: Der Token kommt NICHT hier rein!
// Er wird nur über die Umgebungsvariable HF_TOKEN gelesen
const HF_TOKEN = process.env.HF_TOKEN; // ← Render liefert ihn hier automatisch
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
    return NextResponse.json({ error: 'HF_TOKEN fehlt in den Environment-Variablen' }, { status: 500 });
  }

  // Der Prompt – hier passiert die Magie
  const prompt = `
Du bist ein erfahrener Disponent bei einem Logistikunternehmen.
Plane die bestmöglichen Touren mit folgenden Vorgaben:

Depot: ${depot.name}, ${depot.street}, ${depot.zip} ${depot.city}
Maximales Gewicht pro Tour: ${maxWeightKg} kg
Wichtige Kriterien: PLZ-Nähe → gleiche Regionen zusammenfassen, Liefertermine beachten, Gewicht nicht überschreiten.

Gib MIR NUR ein gültiges JSON zurück – nichts anderes, kein Kommentar, kein Erklärungstext!

Struktur:
{
  "tours": [
    {
      "id": "Tour-1",
      "name": "Tour Ruhrgebiet",
      "region": "Nordrhein-Westfalen",
      "deliveryWindow": "Vormittag",
      "orders": [ /* komplette Bestell-Objekte hier rein */ ],
      "weight": 987.4,
      "stops": 6,
      "distance": 142,
      "aiScore": 92
    }
  ],
  "meta": { "strategy": "PLZ-Clustering + Termin", "totalTours": 3 }
}

Bestellungen:
${JSON.stringify(orders, null, 2)}
`;

  try {
    const response = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`, // ← hier wird dein neuer Token eingesetzt (automatisch von Render)
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1800,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Hugging Face API Fehler ${response.status}: ${err}`);
    }

    const data = await response.json();
    let generated = data[0]?.generated_text || '';

    // LLM gibt manchmal Text drumherum → wir extrahieren nur den JSON-Block
    const jsonMatch = generated.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('KI hat kein gültiges JSON zurückgegeben');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const tours = Array.isArray(parsed.tours) ? parsed.tours : [];

    return NextResponse.json({
      tours,
      meta: parsed.meta || meta || { strategy: 'KI-Planung' },
    });
  } catch (error: any) {
    console.error('KI-Planung fehlgeschlagen:', error);
    return NextResponse.json(
      { error: 'Tourenplanung fehlgeschlagen: ' + error.message },
      { status: 500 }
    );
  }
}