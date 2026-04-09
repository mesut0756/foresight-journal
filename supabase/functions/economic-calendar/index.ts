const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const response = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json');

    if (!response.ok) {
      throw new Error(`API error [${response.status}]`);
    }

    const raw = await response.json();

    // Map FairEconomy format to our format
    const events = (Array.isArray(raw) ? raw : []).map((item: any) => ({
      title: item.title || '',
      country: item.country || '',
      date: item.date || '',
      impact: item.impact || 'Low',
      actual: item.actual ?? '',
      forecast: item.forecast ?? '',
      previous: item.previous ?? '',
    }));

    return new Response(JSON.stringify({ events }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Economic calendar error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
