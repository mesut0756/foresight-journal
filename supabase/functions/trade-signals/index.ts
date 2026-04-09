import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, pair } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Please provide a chart screenshot" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch economic calendar for context
    let newsContext = "";
    try {
      const calRes = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json");
      if (calRes.ok) {
        const events = await calRes.json();
        const pairCurrencies = pair
          ? [pair.substring(0, 3).toUpperCase(), pair.substring(3, 6).toUpperCase()]
          : [];
        const relevant = events
          .filter((e: any) => {
            if (pairCurrencies.length === 0) return true;
            return pairCurrencies.includes(e.country?.toUpperCase());
          })
          .slice(0, 15);
        if (relevant.length > 0) {
          newsContext = `\n\nUpcoming economic events for this pair:\n${relevant
            .map(
              (e: any) =>
                `- ${e.title} (${e.country}) | Impact: ${e.impact} | Date: ${e.date} | Forecast: ${e.forecast || "N/A"} | Previous: ${e.previous || "N/A"} | Actual: ${e.actual || "Pending"}`
            )
            .join("\n")}`;
        }
      }
    } catch {
      // Non-critical, continue without news
    }

    const systemPrompt = `You are an expert forex technical analyst and signal provider. Analyze the provided chart screenshot in detail.

Your analysis MUST include:
1. **Market Structure**: Identify Higher Highs (HH), Higher Lows (HL), Lower Highs (LH), Lower Lows (LL). Note any breaks of structure (BOS) or changes of character (CHoCH).
2. **Trend Analysis**: Current trend direction, strength, and any signs of reversal.
3. **Key Levels**: Support/resistance zones, order blocks, fair value gaps (FVG), liquidity pools.
4. **Price Action**: Current candlestick patterns, momentum, and volume context.
5. **Trade Signal**: Provide a clear BUY or SELL recommendation, or NEUTRAL if no clear setup.
6. **Entry, Stop Loss & Take Profit**: Suggest approximate levels based on the chart.
7. **Risk Assessment**: Rate confidence (Low/Medium/High) and explain risks.
8. **News Impact**: Consider any upcoming economic events that could affect this trade.${newsContext}

Format your response in clear sections with markdown. Be specific about what you see on the chart. If the image is unclear or not a valid chart, say so honestly.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this ${pair || "forex"} chart and provide a detailed trade signal with explanation.`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageBase64.startsWith("data:")
                      ? imageBase64
                      : `data:image/png;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "No analysis generated.";

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("trade-signals error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
