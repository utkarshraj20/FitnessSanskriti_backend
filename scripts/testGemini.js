require('dotenv').config();

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('GEMINI_API_KEY is missing in .env');
        process.exit(1);
    }

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const prompt = process.argv.slice(2).join(' ') || 'Give one short fitness tip for today.';

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: prompt }],
                },
            ],
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Gemini API request failed:');
        console.error(JSON.stringify(data, null, 2));
        process.exit(1);
    }

    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join('\n') || '';

    console.log('Gemini API test succeeded.\n');
    console.log(text || JSON.stringify(data, null, 2));
}

main().catch((error) => {
    console.error('Gemini test script failed:', error.message);
    process.exit(1);
});
