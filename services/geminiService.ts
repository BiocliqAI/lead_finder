import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ApiResponse, GroundingSource } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


export const findCentersAndSpecialists = async (
  city: string,
  numberOfCenters: string,
  specialties: string[],
  userLocation: { latitude: number; longitude: number } | null,
  onStatusUpdate: (message: string) => void
): Promise<ApiResponse> => {
  const numberOfCentersText = numberOfCenters === 'all' ? 'all available' : `the top ${numberOfCenters}`;
  const specialtiesListText = specialties.join(', ');
  const specialtiesJsonDefinition = specialties.map(s => `"${s}": [ { "name": "string", "address": "string", "phone": "string" } ]`).join(',\n            ');

  const prompt = `
    Primary Task: Find ${numberOfCentersText} diagnostic centers in ${city} that are equipped with a CT machine. Use Google ranking to determine the top centers if a number is specified.

    For each of the centers found, you MUST provide the following details:
    1.  Center Information: Its full name, complete address, primary phone number, and official website.
    2.  Ratings and Reviews: Its current Google rating and a concise summary of user reviews.
    3.  CT Machine Confirmation: A boolean 'hasCTMachine' set to true.

    Secondary Task: For EACH diagnostic center you find, you MUST perform a search for nearby medical specialists.
    -   Use the address of the diagnostic center as the central point for your search.
    -   Search for all ${specialtiesListText} within a 5km radius of that center.
    -   For every specialist found, provide their full name, address, and contact phone number. If no specialists are found for a category, return an empty array for that category.

    Your final output MUST be ONLY a single, valid JSON object. Do not include any text, markdown, or explanations outside of the JSON structure. The structure must be exactly as follows:
    {
      "diagnosticCenters": [
        {
          "name": "string",
          "address": "string",
          "contactDetails": {
            "phone": "string",
            "website": "string"
          },
          "googleRating": 4.5,
          "userReviewSummary": "string",
          "hasCTMachine": true,
          "nearbySpecialists": {
            ${specialtiesJsonDefinition}
          }
        }
      ]
    }
  `;

  let response: GenerateContentResponse | undefined;

  try {
    onStatusUpdate(`Finding ${numberOfCentersText} diagnostic centers with CT machines in ${city}...`);
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        ...(userLocation && {
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
            },
          },
        }),
      },
    });

    onStatusUpdate('Parsing AI response...');
    let jsonText = response.text;

    // The model response might be wrapped in markdown ```json ... ``` or just be a raw JSON string.
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonText = jsonMatch[1];
    } else {
      // Fallback for cases where it's not in a markdown block but might have surrounding text.
      const startIndex = jsonText.indexOf('{');
      const endIndex = jsonText.lastIndexOf('}');
      if (startIndex > -1 && endIndex > -1) {
        jsonText = jsonText.substring(startIndex, endIndex + 1);
      }
    }

    const parsedData = JSON.parse(jsonText);

    onStatusUpdate('Extracting data sources...');
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingSources: GroundingSource[] = [];
    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web) {
          groundingSources.push({ uri: chunk.web.uri, title: chunk.web.title, type: 'web' });
        }
        if (chunk.maps) {
          groundingSources.push({ uri: chunk.maps.uri, title: chunk.maps.title, type: 'maps' });
        }
      }
    }
    
    // Deduplicate sources
    const uniqueSources = Array.from(new Map(groundingSources.map(item => [item.uri, item])).values());
    
    onStatusUpdate('Compiling results...');

    return { diagnosticCenters: parsedData.diagnosticCenters || [], groundingSources: uniqueSources };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof SyntaxError) {
        console.error("Failed to parse JSON from response:", response?.text);
        throw new Error("The response from the AI was not in a valid format. Please try again.");
    }
    throw new Error("Failed to fetch data from Gemini. Please check your prompt or API key.");
  }
};